import dotenv from "dotenv";

dotenv.config();

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

function envAddress(name: string, fallback: `0x${string}`): `0x${string}` {
  const value = process.env[name];
  if (!value) return fallback;
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }
  return value as `0x${string}`;
}

function envInteger(name: string, fallback: number, minimum: number): number {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
  }
  return value;
}

function envOrigin(name: string, fallback: string): string {
  const raw = (process.env[name] || fallback).trim().replace(/\/$/, "");
  const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) origin or hostname`);
  }
}

export const config = {
  PORT: Number.parseInt(process.env.PORT || "3001", 10),
  RPC_URL: process.env.RPC_URL || "https://coston2-api.flare.network/ext/C/rpc",
  CHAIN_ID: 114,

  SEND_CONTRACT_ADDRESS: envAddress("SEND_CONTRACT_ADDRESS", ZERO_ADDRESS),
  RATE_READER_ADDRESS: envAddress("RATE_READER_ADDRESS", ZERO_ADDRESS),
  MERCHANT_PAYMENT_ADDRESS: envAddress("MERCHANT_PAYMENT_ADDRESS", ZERO_ADDRESS),

  // Official Coston2 protocol addresses. Resolve AssetManager dynamically before mainnet use.
  FXRP_ADDRESS: envAddress("FXRP_ADDRESS", "0x0b6A3645c240605887a5532109323A3E12273dc7"),
  ASSET_MANAGER_FXRP_ADDRESS: envAddress(
    "ASSET_MANAGER_FXRP_ADDRESS",
    "0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA"
  ),
  FTSO_V2_ADDRESS: envAddress("FTSO_V2_ADDRESS", "0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d"),

  INDEXER_START_BLOCK: envInteger("INDEXER_START_BLOCK", 0, 0),
  INDEXER_BLOCK_CHUNK: envInteger("INDEXER_BLOCK_CHUNK", 2000, 1),
  RATE_REFRESH_INTERVAL_MS: envInteger("RATE_REFRESH_INTERVAL_MS", 30000, 1000),
  IDR_REFRESH_INTERVAL_MS: envInteger("IDR_REFRESH_INTERVAL_MS", 60000, 1000),
  DB_PATH: process.env.DB_PATH || "./flareit.db",
  FRONTEND_URL: envOrigin("FRONTEND_URL", "http://localhost:3000"),
  COINGECKO_API_URL: "https://api.coingecko.com/api/v3",

  XAMAN_API_KEY: process.env.XAMAN_API_KEY || "",
  XAMAN_API_SECRET: process.env.XAMAN_API_SECRET || "",
};

export function isConfigured(address: string): boolean {
  return address !== ZERO_ADDRESS;
}

export default config;
