import express from "express";
import cors from "cors";
import { config, isConfigured } from "./config";
import transactionsRouter from "./routes/transactions";
import rateRouter from "./routes/rate";
import fassetsRouter from "./routes/fassets";
import paymentsRouter from "./routes/payments";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(cors({
    origin: [config.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  app.use("/api/transactions", transactionsRouter);
  app.use("/api/rate", rateRouter);
  app.use("/api/fassets", fassetsRouter);
  app.use("/api/payments", paymentsRouter);

  app.get("/health", (_req, res) => {
    const required = {
      sendContract: isConfigured(config.SEND_CONTRACT_ADDRESS),
      rateReader: isConfigured(config.RATE_READER_ADDRESS),
      merchantPayment: isConfigured(config.MERCHANT_PAYMENT_ADDRESS),
      fxrp: isConfigured(config.FXRP_ADDRESS),
      assetManager: isConfigured(config.ASSET_MANAGER_FXRP_ADDRESS),
    };
    const ready = required.sendContract && required.merchantPayment && required.fxrp && required.assetManager;
    res.json({
      status: ready ? "ready" : "degraded",
      project: "FlareIt Backend",
      network: "Flare Coston2 Testnet",
      chainId: config.CHAIN_ID,
      required,
      contracts: {
        sendContract: config.SEND_CONTRACT_ADDRESS,
        rateReader: config.RATE_READER_ADDRESS,
        merchantPayment: config.MERCHANT_PAYMENT_ADDRESS,
        fxrp: config.FXRP_ADDRESS,
        assetManager: config.ASSET_MANAGER_FXRP_ADDRESS,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  return app;
}

// `src/app.ts` is a Vercel-recognized Express entrypoint.
export default createApp();
