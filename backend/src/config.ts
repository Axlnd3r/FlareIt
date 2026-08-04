import dotenv from "dotenv";
dotenv.config();

export const config = {
  // ─── Server ────────────────────────────────────────────────────────────────
  PORT: parseInt(process.env.PORT || "3001"),

  // ─── Blockchain ────────────────────────────────────────────────────────────
  RPC_URL: process.env.RPC_URL || "https://coston2-api.flare.network/ext/C/rpc",
  CHAIN_ID: 114,

  // ─── Contract Addresses (fill these after deploying Fase 1) ───────────────
  // These will be populated from environment variables after deployment
  SEND_CONTRACT_ADDRESS: (process.env.SEND_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  RATE_READER_ADDRESS: (process.env.RATE_READER_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  FXRP_ADDRESS: (process.env.FXRP_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  // ─── Rate Cache ────────────────────────────────────────────────────────────
  RATE_REFRESH_INTERVAL_MS: parseInt(process.env.RATE_REFRESH_INTERVAL_MS || "30000"), // 30s

  // ─── Database ──────────────────────────────────────────────────────────────
  DB_PATH: process.env.DB_PATH || "./flareit.db",

  // ─── CORS ──────────────────────────────────────────────────────────────────
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // ─── External APIs ─────────────────────────────────────────────────────────
  // CoinGecko for IDR rate (off-chain reference, clearly labeled in UI)
  COINGECKO_API_URL: "https://api.coingecko.com/api/v3",
  IDR_REFRESH_INTERVAL_MS: parseInt(process.env.IDR_REFRESH_INTERVAL_MS || "60000"), // 60s
};

export default config;
