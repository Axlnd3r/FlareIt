import { Router, Request, Response } from "express";
import { createPublicClient, http } from "viem";
import { config } from "../config";

const router = Router();

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

// ─── RateReader ABI (minimal) ─────────────────────────────────────────────────
const RATE_READER_ABI = [
  {
    name: "getXrpUsdRateWei",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "priceWei", type: "uint256" },
      { name: "timestamp", type: "uint64" },
    ],
  },
  {
    name: "isFeedFresh",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "isFresh", type: "bool" },
      { name: "feedTimestamp", type: "uint64" },
    ],
  },
] as const;

// ─── Rate Cache ───────────────────────────────────────────────────────────────
interface RateCache {
  xrpUsd: number;        // XRP/USD from FTSO v2 (on-chain, real)
  xrpIdr: number;        // XRP/IDR = xrpUsd × usdIdr (derived)
  usdIdr: number;        // USD/IDR from CoinGecko (off-chain, labeled)
  ftsoTimestamp: number; // FTSO feed timestamp
  cacheUpdatedAt: number;
  ftsoFeedFresh: boolean;
  sources: {
    xrpUsd: "ftso-v2-on-chain";
    usdIdr: "coingecko-off-chain";
    xrpIdr: "derived";
  };
}

let rateCache: RateCache | null = null;
let lastFtsoUpdate = 0;
let lastIdrUpdate = 0;
let cachedUsdIdr = 15800; // fallback IDR rate if CoinGecko fails

// ─── Fetch XRP/USD from FTSO v2 (on-chain) ───────────────────────────────────
async function fetchXrpUsdFromFtso(): Promise<{ priceUsd: number; timestamp: number; isFresh: boolean }> {
  if (config.RATE_READER_ADDRESS === "0x0000000000000000000000000000000000000000") {
    // Contract not deployed yet — return mock for development
    console.log("[Rate] RateReader not configured, using dev mock");
    return { priceUsd: 0.52, timestamp: Math.floor(Date.now() / 1000), isFresh: true };
  }

  const client = createPublicClient({
    chain: coston2Chain,
    transport: http(config.RPC_URL),
  });

  try {
    const [rateResult, freshResult] = await Promise.all([
      client.readContract({
        address: config.RATE_READER_ADDRESS,
        abi: RATE_READER_ABI,
        functionName: "getXrpUsdRateWei",
      }),
      client.readContract({
        address: config.RATE_READER_ADDRESS,
        abi: RATE_READER_ABI,
        functionName: "isFeedFresh",
      }),
    ]);

    const [priceWei, timestamp] = rateResult;
    const [isFresh] = freshResult;

    // Convert from 18-decimal wei to USD float
    const priceUsd = Number(priceWei) / 1e18;

    return { priceUsd, timestamp: Number(timestamp), isFresh };
  } catch (err) {
    console.error("[Rate] FTSO read error:", err);
    // Return last cached value if available
    if (rateCache) {
      return {
        priceUsd: rateCache.xrpUsd,
        timestamp: rateCache.ftsoTimestamp,
        isFresh: false,
      };
    }
    throw err;
  }
}

// ─── Fetch USD/IDR from CoinGecko (off-chain) ────────────────────────────────
async function fetchUsdIdrFromCoinGecko(): Promise<number> {
  try {
    const res = await fetch(
      `${config.COINGECKO_API_URL}/simple/price?ids=ripple&vs_currencies=idr`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

    const data = await res.json() as { ripple?: { idr?: number } };
    const xrpIdrFromCoingecko = data.ripple?.idr;

    if (!xrpIdrFromCoingecko || xrpIdrFromCoingecko <= 0) {
      throw new Error("Invalid CoinGecko response");
    }

    // We want USD/IDR, not XRP/IDR — use XRP/USD from FTSO to derive
    // USD/IDR = XRP/IDR (CoinGecko) / XRP/USD (FTSO)
    const currentXrpUsd = rateCache?.xrpUsd ?? 0.52;
    const derivedUsdIdr = currentXrpUsd > 0 ? xrpIdrFromCoingecko / currentXrpUsd : 15800;

    cachedUsdIdr = derivedUsdIdr;
    console.log(`[Rate] CoinGecko: XRP/IDR=${xrpIdrFromCoingecko}, derived USD/IDR=${derivedUsdIdr.toFixed(0)}`);
    return derivedUsdIdr;
  } catch (err) {
    console.warn("[Rate] CoinGecko failed, using cached IDR rate:", cachedUsdIdr, err);
    return cachedUsdIdr;
  }
}

// ─── Update rate cache ────────────────────────────────────────────────────────
async function updateRateCache(): Promise<void> {
  const now = Date.now();

  let xrpUsd = rateCache?.xrpUsd ?? 0;
  let ftsoTimestamp = rateCache?.ftsoTimestamp ?? 0;
  let isFresh = rateCache?.ftsoFeedFresh ?? false;

  // Refresh FTSO rate every RATE_REFRESH_INTERVAL_MS
  if (now - lastFtsoUpdate > config.RATE_REFRESH_INTERVAL_MS) {
    try {
      const ftsoData = await fetchXrpUsdFromFtso();
      xrpUsd = ftsoData.priceUsd;
      ftsoTimestamp = ftsoData.timestamp;
      isFresh = ftsoData.isFresh;
      lastFtsoUpdate = now;
      console.log(`[Rate] FTSO XRP/USD = $${xrpUsd.toFixed(4)} (fresh: ${isFresh})`);
    } catch (err) {
      console.error("[Rate] Failed to update FTSO rate:", err);
    }
  }

  // Refresh IDR rate every IDR_REFRESH_INTERVAL_MS
  if (now - lastIdrUpdate > config.IDR_REFRESH_INTERVAL_MS) {
    const usdIdr = await fetchUsdIdrFromCoinGecko();
    cachedUsdIdr = usdIdr;
    lastIdrUpdate = now;
  }

  rateCache = {
    xrpUsd,
    usdIdr: cachedUsdIdr,
    xrpIdr: xrpUsd * cachedUsdIdr,
    ftsoTimestamp,
    cacheUpdatedAt: Math.floor(now / 1000),
    ftsoFeedFresh: isFresh,
    sources: {
      xrpUsd: "ftso-v2-on-chain",
      usdIdr: "coingecko-off-chain",
      xrpIdr: "derived",
    },
  };
}

// ─── Start background rate updater ───────────────────────────────────────────
export function startRateUpdater(): void {
  console.log("[Rate] Starting rate cache updater...");
  updateRateCache().catch(console.error);
  setInterval(() => updateRateCache().catch(console.error), config.RATE_REFRESH_INTERVAL_MS);
}

/**
 * GET /api/rate
 * Returns cached XRP/USD (on-chain FTSO) + derived IDR rates
 *
 * Response includes source metadata so the frontend can display
 * honest labels: "XRP/USD from FTSO v2 (on-chain)" vs "IDR rate from CoinGecko (off-chain)"
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!rateCache || Date.now() - lastFtsoUpdate > config.RATE_REFRESH_INTERVAL_MS * 3) {
      await updateRateCache();
    }

    if (!rateCache) {
      res.status(503).json({ error: "Rate data not available yet, try again shortly" });
      return;
    }

    res.json(rateCache);
  } catch (err) {
    console.error("[API/rate] Error:", err);
    res.status(500).json({ error: "Failed to fetch rate data" });
  }
});

export default router;
