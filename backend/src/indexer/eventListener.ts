import { createPublicClient, http, parseAbiItem } from "viem";
import { config } from "../config";
import { getDb, insertTransaction, getLastBlock, updateLastBlock, saveDb } from "../db/database";

// ─── ABI for SendContract Sent event ─────────────────────────────────────────
const SENT_EVENT = parseAbiItem(
  "event Sent(address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp)"
);

// ─── Coston2 chain definition ─────────────────────────────────────────────────
const coston2Chain = {
  id: 114,
  name: "Flare Coston2",
  network: "coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: {
    default: { http: [config.RPC_URL] },
    public: { http: [config.RPC_URL] },
  },
} as const;

let isRunning = false;
let unwatch: (() => void) | null = null;

export async function startEventListener(): Promise<void> {
  if (isRunning) {
    console.log("[Indexer] Already running");
    return;
  }

  const sendContractAddress = config.SEND_CONTRACT_ADDRESS;

  // Skip if contract not configured yet
  if (sendContractAddress === "0x0000000000000000000000000000000000000000") {
    console.log("[Indexer] ⚠ SEND_CONTRACT_ADDRESS not set — indexer skipped");
    console.log("[Indexer]   Set SEND_CONTRACT_ADDRESS in .env after deploying contracts");
    return;
  }

  const client = createPublicClient({
    chain: coston2Chain,
    transport: http(config.RPC_URL),
  });

  const db = await getDb();

  console.log("[Indexer] Starting event listener...");
  console.log("[Indexer] Contract:", sendContractAddress);
  console.log("[Indexer] RPC:", config.RPC_URL);

  // ─── Catch up: index historical events from last known block ──────────────
  try {
    const lastBlock = getLastBlock(db);
    const currentBlock = await client.getBlockNumber();
    console.log(`[Indexer] Catching up from block ${lastBlock} to ${currentBlock}`);

    if (lastBlock > 0) {
      const fromBlock = BigInt(lastBlock + 1);
      const logs = await client.getLogs({
        address: sendContractAddress,
        event: SENT_EVENT,
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(`[Indexer] Found ${logs.length} historical events to index`);

      for (const log of logs) {
        if (!log.args.sender || !log.args.recipient || !log.args.amount) continue;

        insertTransaction(db, {
          sender: log.args.sender.toLowerCase(),
          recipient: log.args.recipient.toLowerCase(),
          amount: log.args.amount.toString(),
          tx_hash: log.transactionHash ?? "",
          block_number: Number(log.blockNumber),
          log_index: log.logIndex ?? 0,
          created_at: Number(log.args.timestamp ?? Math.floor(Date.now() / 1000)),
        });
      }

      updateLastBlock(db, Number(currentBlock));
      saveDb();
    }
  } catch (err) {
    console.error("[Indexer] Error during historical catch-up:", err);
  }

  // ─── Live listener: watch for new events ─────────────────────────────────
  unwatch = client.watchContractEvent({
    address: sendContractAddress,
    abi: [SENT_EVENT],
    eventName: "Sent",
    onLogs: (logs) => {
      for (const log of logs) {
        if (!log.args.sender || !log.args.recipient || !log.args.amount) continue;

        const tx = {
          sender: log.args.sender.toLowerCase(),
          recipient: log.args.recipient.toLowerCase(),
          amount: log.args.amount.toString(),
          tx_hash: log.transactionHash ?? "",
          block_number: log.blockNumber ? Number(log.blockNumber) : null,
          log_index: log.logIndex ?? 0,
          created_at: Number(log.args.timestamp ?? Math.floor(Date.now() / 1000)),
        };

        const inserted = insertTransaction(db, tx);

        if (inserted) {
          console.log(
            `[Indexer] ✓ Indexed: ${tx.sender.slice(0, 8)}... → ${tx.recipient.slice(0, 8)}... | ${
              Number(tx.amount) / 1e6
            } FXRP | tx: ${tx.tx_hash.slice(0, 10)}...`
          );

          if (tx.block_number) {
            updateLastBlock(db, tx.block_number);
          }
          saveDb();
        }
      }
    },
    onError: (error) => {
      console.error("[Indexer] Polling error:", error.message);
    },
    poll: true,
    pollingInterval: 3000, // Poll every 3 seconds
  });

  isRunning = true;
  console.log("[Indexer] ✓ Live event listener active (polling every 3s)");
}

export function stopEventListener(): void {
  if (unwatch) {
    unwatch();
    unwatch = null;
  }
  isRunning = false;
  console.log("[Indexer] Stopped");
}
