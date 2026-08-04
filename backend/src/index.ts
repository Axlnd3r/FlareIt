import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "./config";
import transactionsRouter from "./routes/transactions";
import rateRouter, { startRateUpdater } from "./routes/rate";
import { startEventListener } from "./indexer/eventListener";

dotenv.config();

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(express.json());
app.use(cors({
  origin: [config.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/transactions", transactionsRouter);
app.use("/api/rate", rateRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    project: "FlareIt Backend",
    network: "Flare Coston2 Testnet",
    chainId: config.CHAIN_ID,
    contracts: {
      sendContract: config.SEND_CONTRACT_ADDRESS,
      rateReader: config.RATE_READER_ADDRESS,
      fxrp: config.FXRP_ADDRESS,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║    FlareIt Backend — Starting Up     ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Network: Flare Coston2 (Chain ID ${config.CHAIN_ID})`);
  console.log(`RPC:     ${config.RPC_URL}`);
  console.log(`Port:    ${config.PORT}`);

  // Start background services
  startRateUpdater();
  await startEventListener();

  // Start server
  app.listen(config.PORT, () => {
    console.log(`\n✓ Server running at http://localhost:${config.PORT}`);
    console.log(`✓ Health:       http://localhost:${config.PORT}/health`);
    console.log(`✓ Rate API:     http://localhost:${config.PORT}/api/rate`);
    console.log(`✓ Txn API:      http://localhost:${config.PORT}/api/transactions/:address`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
