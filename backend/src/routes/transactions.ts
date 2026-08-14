import { Router, Request, Response } from "express";
import { config, isConfigured } from "../config";

const router = Router();
const SENT_TOPIC = "0x34355b4c5dff25f21b90975d65f648edf2c50bea228323bb74333bfe5f015f3c";

interface ExplorerLog {
  blockNumber?: string;
  data?: string;
  logIndex?: string;
  timeStamp?: string;
  topics?: string[];
  transactionHash?: string;
}

function emptyHistory(address: string) {
  return {
    address: address.toLowerCase(),
    count: 0,
    transactions: [],
    source: "coston2-explorer",
  };
}

function topicAddress(topic: string | undefined): string | null {
  if (!topic || !/^0x[a-fA-F0-9]{64}$/.test(topic)) return null;
  return `0x${topic.slice(-40)}`.toLowerCase();
}

function uintWord(data: string | undefined, index: number): bigint | null {
  if (!data || !/^0x[a-fA-F0-9]+$/.test(data)) return null;
  const start = 2 + index * 64;
  const word = data.slice(start, start + 64);
  if (word.length !== 64) return null;
  return BigInt(`0x${word}`);
}

function hexNumber(value: string | undefined): number | null {
  if (!value || !/^0x[a-fA-F0-9]+$/.test(value)) return null;
  const parsed = Number(BigInt(value));
  return Number.isSafeInteger(parsed) ? parsed : null;
}

async function fetchSentLogs(): Promise<ExplorerLog[]> {
  if (!isConfigured(config.SEND_CONTRACT_ADDRESS)) return [];

  const query = new URLSearchParams({
    module: "logs",
    action: "getLogs",
    fromBlock: String(config.INDEXER_START_BLOCK),
    toBlock: "latest",
    address: config.SEND_CONTRACT_ADDRESS,
    topic0: SENT_TOPIC,
  });
  const response = await fetch(`${config.EXPLORER_API_URL}?${query.toString()}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Explorer HTTP ${response.status}`);

  const body = await response.json() as {
    status?: string;
    message?: string;
    result?: ExplorerLog[] | string;
  };
  if (body.status === "0" && /no (records|logs) found/i.test(String(body.message || body.result))) {
    return [];
  }
  if (!Array.isArray(body.result)) {
    throw new Error(`Explorer log query failed: ${body.message || body.result || "invalid response"}`);
  }
  return body.result;
}

/**
 * GET /api/transactions/:address
 * Reads SendContract events from the Coston2 explorer on demand. This keeps
 * history available on both persistent servers and stateless Vercel Functions.
 */
router.get("/:address", async (req: Request, res: Response): Promise<void> => {
  const { address } = req.params;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({
      error: "Invalid address format",
      message: "Address must be a valid EVM address (0x + 40 hex chars)",
    });
    return;
  }

  const normalizedAddress = address.toLowerCase();
  try {
    const logs = await fetchSentLogs();
    const decoded = logs.flatMap((log) => {
      const sender = topicAddress(log.topics?.[1]);
      const recipient = topicAddress(log.topics?.[2]);
      const amount = uintWord(log.data, 0);
      const eventTimestamp = uintWord(log.data, 1);
      if (!sender || !recipient || amount === null || !log.transactionHash) return [];
      if (sender !== normalizedAddress && recipient !== normalizedAddress) return [];

      return [{
        sender,
        recipient,
        amount: amount.toString(),
        amountFxrp: (Number(amount) / 1_000_000).toFixed(6),
        txHash: log.transactionHash,
        blockNumber: hexNumber(log.blockNumber),
        createdAt: eventTimestamp === null
          ? (hexNumber(log.timeStamp) || 0)
          : Number(eventTimestamp),
        direction: sender === normalizedAddress ? "sent" as const : "received" as const,
      }];
    });
    decoded.sort((a, b) => b.createdAt - a.createdAt);
    const transactions = decoded.slice(0, 100).map((transaction, index) => ({
      id: index + 1,
      ...transaction,
    }));

    res.json({
      address: normalizedAddress,
      count: transactions.length,
      transactions,
      source: "coston2-explorer",
    });
  } catch (error) {
    console.error("[API/transactions] Explorer error:", error);
    if (!isConfigured(config.SEND_CONTRACT_ADDRESS)) {
      res.json(emptyHistory(normalizedAddress));
      return;
    }
    res.status(502).json({
      error: "Explorer unavailable",
      message: "Failed to fetch on-chain transaction history",
    });
  }
});

export default router;
