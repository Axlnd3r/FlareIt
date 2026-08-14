import { Router, Request, Response } from "express";
import { createPublicClient, http } from "viem";
import { config, isConfigured } from "../config";

const router = Router();
const XRP_USD_FEED_ID = "0x015852502f55534400000000000000000000000000" as const;
const MAX_FTSO_AGE_SECONDS = 300;

const chain = {
  id: 114,
  name: "Flare Coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: { default: { http: [config.RPC_URL] } },
} as const;

const client = createPublicClient({ chain, transport: http(config.RPC_URL) });

const RATE_READER_ABI = [{
  name: "getXrpUsdRateWei",
  type: "function",
  stateMutability: "view",
  inputs: [],
  outputs: [
    { name: "priceWei", type: "uint256" },
    { name: "timestamp", type: "uint64" },
  ],
}] as const;

const FTSO_ABI = [{
  name: "getFeedById",
  type: "function",
  stateMutability: "view",
  inputs: [{ name: "feedId", type: "bytes21" }],
  outputs: [
    { name: "value", type: "uint256" },
    { name: "decimals", type: "int8" },
    { name: "timestamp", type: "uint64" },
  ],
}] as const;

export interface RateData {
  xrpUsd: number;
  xrpIdr: number;
  usdIdr: number;
  ftsoTimestamp: number;
  cacheUpdatedAt: number;
  ftsoFeedFresh: boolean;
  sources: {
    xrpUsd: "rate-reader-on-chain" | "ftso-v2-direct-on-chain";
    usdIdr: "coingecko-off-chain" | "coingecko-off-chain-stale-cache";
    xrpIdr: "derived";
  };
}

let rateCache: RateData | null = null;
let lastFtsoUpdate = 0;
let lastIdrUpdate = 0;
let cachedUsdIdr: number | null = null;
let rateTimer: NodeJS.Timeout | null = null;

export function validateFtsoRate(priceUsd: number, timestamp: number): void {
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error("FTSO returned a zero or invalid XRP/USD price");
  }
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0 || timestamp > now + 60) {
    throw new Error("FTSO returned an invalid timestamp");
  }
  if (now - timestamp > MAX_FTSO_AGE_SECONDS) {
    throw new Error(`FTSO XRP/USD feed is stale by ${now - timestamp} seconds`);
  }
}

async function fetchXrpUsd(): Promise<{
  priceUsd: number;
  timestamp: number;
  source: RateData["sources"]["xrpUsd"];
}> {
  if (isConfigured(config.RATE_READER_ADDRESS)) {
    const [priceWei, timestamp] = await client.readContract({
      address: config.RATE_READER_ADDRESS,
      abi: RATE_READER_ABI,
      functionName: "getXrpUsdRateWei",
    });
    const result = {
      priceUsd: Number(priceWei) / 1e18,
      timestamp: Number(timestamp),
      source: "rate-reader-on-chain",
    } as const;
    validateFtsoRate(result.priceUsd, result.timestamp);
    return result;
  }

  const [value, decimals, timestamp] = await client.readContract({
    address: config.FTSO_V2_ADDRESS,
    abi: FTSO_ABI,
    functionName: "getFeedById",
    args: [XRP_USD_FEED_ID],
  });
  const scale = 10 ** Number(decimals);
  const result = {
    priceUsd: Number(value) / scale,
    timestamp: Number(timestamp),
    source: "ftso-v2-direct-on-chain",
  } as const;
  validateFtsoRate(result.priceUsd, result.timestamp);
  return result;
}

async function fetchUsdIdr(xrpUsd: number): Promise<{
  value: number;
  source: RateData["sources"]["usdIdr"];
}> {
  try {
    const response = await fetch(
      `${config.COINGECKO_API_URL}/simple/price?ids=ripple&vs_currencies=idr`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);

    const data = await response.json() as { ripple?: { idr?: number } };
    const xrpIdr = data.ripple?.idr;
    if (!xrpIdr || xrpIdr <= 0 || xrpUsd <= 0) throw new Error("Invalid rate response");

    cachedUsdIdr = xrpIdr / xrpUsd;
    return { value: cachedUsdIdr, source: "coingecko-off-chain" };
  } catch (error) {
    if (cachedUsdIdr) {
      console.warn("[Rate] CoinGecko unavailable; serving labeled stale cache", error);
      return { value: cachedUsdIdr, source: "coingecko-off-chain-stale-cache" };
    }
    throw error;
  }
}

export async function updateRateCache(force = false): Promise<RateData> {
  const now = Date.now();
  const refreshFtso = force || !rateCache || now - lastFtsoUpdate >= config.RATE_REFRESH_INTERVAL_MS;
  const ftso = refreshFtso
    ? await fetchXrpUsd()
    : {
        priceUsd: rateCache!.xrpUsd,
        timestamp: rateCache!.ftsoTimestamp,
        source: rateCache!.sources.xrpUsd,
      };
  if (refreshFtso) lastFtsoUpdate = now;

  const refreshIdr = force || !cachedUsdIdr || now - lastIdrUpdate >= config.IDR_REFRESH_INTERVAL_MS;
  const idr = refreshIdr
    ? await fetchUsdIdr(ftso.priceUsd)
    : { value: cachedUsdIdr!, source: rateCache!.sources.usdIdr };
  if (refreshIdr) lastIdrUpdate = now;

  const nowSeconds = Math.floor(now / 1000);
  rateCache = {
    xrpUsd: ftso.priceUsd,
    usdIdr: idr.value,
    xrpIdr: ftso.priceUsd * idr.value,
    ftsoTimestamp: ftso.timestamp,
    cacheUpdatedAt: nowSeconds,
    ftsoFeedFresh: nowSeconds - ftso.timestamp <= MAX_FTSO_AGE_SECONDS,
    sources: { xrpUsd: ftso.source, usdIdr: idr.source, xrpIdr: "derived" },
  };
  return rateCache;
}

export async function getRateSnapshot(): Promise<RateData> {
  if (!rateCache || Date.now() - lastFtsoUpdate > config.RATE_REFRESH_INTERVAL_MS * 3) {
    return updateRateCache();
  }
  return rateCache;
}

export function startRateUpdater(): void {
  if (rateTimer) return;
  updateRateCache().catch((error) => console.error("[Rate] Initial update failed", error));
  rateTimer = setInterval(
    () => updateRateCache().catch((error) => console.error("[Rate] Update failed", error)),
    config.RATE_REFRESH_INTERVAL_MS
  );
  rateTimer.unref();
}

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getRateSnapshot());
  } catch (error) {
    console.error("[API/rate] Rate unavailable", error);
    res.status(503).json({
      error: "Verified rate data is unavailable",
      code: "RATE_UNAVAILABLE",
    });
  }
});

export default router;
