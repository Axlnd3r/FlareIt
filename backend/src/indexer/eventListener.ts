import { createPublicClient, http, parseAbiItem, type PublicClient } from "viem";
import { config, isConfigured } from "../config";
import type { Database } from "sql.js";
import { getDb, insertTransaction, getLastBlock, updateLastBlock, saveDb } from "../db/database";

const SENT_EVENT = parseAbiItem(
  "event Sent(address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp)"
);

const chain = {
  id: 114,
  name: "Flare Coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: { default: { http: [config.RPC_URL] } },
} as const;

let isRunning = false;
let pollTimer: NodeJS.Timeout | null = null;
let syncing = false;

async function syncToTip(client: PublicClient, db: Database): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    const currentBlock = await client.getBlockNumber();
    const storedBlock = getLastBlock(db);
    const configuredStart = Math.max(0, config.INDEXER_START_BLOCK);
    let cursor = BigInt(storedBlock > 0 ? storedBlock + 1 : configuredStart || Number(currentBlock));

    while (cursor <= currentBlock) {
      const end = cursor + BigInt(config.INDEXER_BLOCK_CHUNK - 1) > currentBlock
        ? currentBlock
        : cursor + BigInt(config.INDEXER_BLOCK_CHUNK - 1);
      const logs = await client.getLogs({
        address: config.SEND_CONTRACT_ADDRESS,
        event: SENT_EVENT,
        fromBlock: cursor,
        toBlock: end,
      });

      for (const log of logs) {
        if (!log.args.sender || !log.args.recipient || log.args.amount === undefined) continue;
        insertTransaction(db, {
          sender: log.args.sender.toLowerCase(),
          recipient: log.args.recipient.toLowerCase(),
          amount: log.args.amount.toString(),
          tx_hash: log.transactionHash,
          block_number: Number(log.blockNumber),
          log_index: log.logIndex,
          created_at: Number(log.args.timestamp),
        });
      }
      updateLastBlock(db, Number(end));
      saveDb();
      cursor = end + 1n;
    }
  } finally {
    syncing = false;
  }
}

export async function startEventListener(): Promise<void> {
  if (isRunning) return;
  if (!isConfigured(config.SEND_CONTRACT_ADDRESS)) {
    console.warn("[Indexer] SEND_CONTRACT_ADDRESS is not configured; listener disabled");
    return;
  }

  const client = createPublicClient({ chain, transport: http(config.RPC_URL) });
  const bytecode = await client.getBytecode({ address: config.SEND_CONTRACT_ADDRESS });
  if (!bytecode) throw new Error("SEND_CONTRACT_ADDRESS has no bytecode on Coston2");

  const db = await getDb();
  await syncToTip(client, db);
  pollTimer = setInterval(
    () => syncToTip(client, db).catch((error) => console.error("[Indexer] Polling error", error)),
    3000
  );
  pollTimer.unref();
  isRunning = true;
  console.log("[Indexer] Gap-free block polling active");
}

export function stopEventListener(): void {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  isRunning = false;
}
