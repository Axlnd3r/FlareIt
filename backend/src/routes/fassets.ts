import { Router, Request, Response } from "express";
import { createPublicClient, http, isAddress } from "viem";
import { config } from "../config";

const router = Router();
const DIRECT_MINT_PREFIX = "4642505266410018";
const XAMAN_WINDOW_MS = 60_000;
const XAMAN_MAX_REQUESTS_PER_WINDOW = 10;
const xamanRequests = new Map<string, { count: number; resetAt: number }>();

const chain = {
  id: 114,
  name: "Flare Coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: { default: { http: [config.RPC_URL] } },
} as const;
const client = createPublicClient({ chain, transport: http(config.RPC_URL) });

const ASSET_MANAGER_ABI = [
  { name: "directMintingPaymentAddress", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "getDirectMintingMinimumFeeUBA", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getDirectMintingFeeBIPS", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getDirectMintingExecutorFeeUBA", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

export function buildDirectMintingMemo(recipient: string): string {
  if (!isAddress(recipient)) throw new Error("Invalid Coston2 recipient address");
  return `${DIRECT_MINT_PREFIX}00000000${recipient.slice(2).toLowerCase()}`.toUpperCase();
}

function xrpToDrops(value: unknown): bigint {
  if (typeof value !== "string" || !/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error("amountXrp must be a positive decimal with at most 6 decimals");
  }
  const [whole, fraction = ""] = value.split(".");
  const drops = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"));
  if (drops <= 0n) throw new Error("amountXrp must be greater than zero");
  return drops;
}

async function getSettings() {
  const address = config.ASSET_MANAGER_FXRP_ADDRESS;
  const [destination, minimumFee, feeBips, executorFee] = await Promise.all([
    client.readContract({ address, abi: ASSET_MANAGER_ABI, functionName: "directMintingPaymentAddress" }),
    client.readContract({ address, abi: ASSET_MANAGER_ABI, functionName: "getDirectMintingMinimumFeeUBA" }),
    client.readContract({ address, abi: ASSET_MANAGER_ABI, functionName: "getDirectMintingFeeBIPS" }),
    client.readContract({ address, abi: ASSET_MANAGER_ABI, functionName: "getDirectMintingExecutorFeeUBA" }),
  ]);
  return { destination, minimumFee, feeBips, executorFee };
}

export async function prepareDirectMint(recipient: string, amountXrp: unknown) {
  const grossDrops = xrpToDrops(amountXrp);
  const settings = await getSettings();
  const percentageFee = grossDrops * settings.feeBips / 10_000n;
  const mintingFee = percentageFee > settings.minimumFee ? percentageFee : settings.minimumFee;
  const totalFees = mintingFee + settings.executorFee;
  if (grossDrops <= totalFees) {
    throw new Error("Amount is too small after the current minting and executor fees");
  }

  const memoData = buildDirectMintingMemo(recipient);
  return {
    network: "XRPL Testnet -> Flare Coston2",
    mode: "fassets-direct-mint-memo",
    assetManager: config.ASSET_MANAGER_FXRP_ADDRESS,
    fxrp: config.FXRP_ADDRESS,
    quote: {
      grossDrops: grossDrops.toString(),
      mintingFeeDrops: mintingFee.toString(),
      executorFeeDrops: settings.executorFee.toString(),
      estimatedNetFxrpDrops: (grossDrops - totalFees).toString(),
      feeBips: settings.feeBips.toString(),
    },
    xrplTransaction: {
      TransactionType: "Payment",
      Destination: settings.destination,
      Amount: grossDrops.toString(),
      Memos: [{ Memo: { MemoData: memoData } }],
    },
    warning: "Verify destination, amount, recipient, and memo before signing. Incorrect XRPL payments can be irreversible.",
  };
}

function allowXamanRequest(ip: string): boolean {
  const now = Date.now();
  const current = xamanRequests.get(ip);
  if (!current || current.resetAt <= now) {
    xamanRequests.set(ip, { count: 1, resetAt: now + XAMAN_WINDOW_MS });
    return true;
  }
  current.count += 1;
  return current.count <= XAMAN_MAX_REQUESTS_PER_WINDOW;
}

async function fetchXaman(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`https://xumm.app/api/v1/platform/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.XAMAN_API_KEY,
      "X-API-Secret": config.XAMAN_API_SECRET,
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Xaman HTTP ${response.status}`);
  return payload;
}

router.get("/settings", async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getSettings();
    res.json({
      network: "Coston2",
      assetManager: config.ASSET_MANAGER_FXRP_ADDRESS,
      fxrp: config.FXRP_ADDRESS,
      directMintingPaymentAddress: settings.destination,
      minimumFeeDrops: settings.minimumFee.toString(),
      executorFeeDrops: settings.executorFee.toString(),
      feeBips: settings.feeBips.toString(),
    });
  } catch (error) {
    console.error("[FAssets] Settings failed", error);
    res.status(503).json({ error: "FAssets settings unavailable" });
  }
});

router.post("/direct-mint/prepare", async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await prepareDirectMint(req.body?.recipient, req.body?.amountXrp));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid direct mint request" });
  }
});

router.post("/direct-mint/xaman", async (req: Request, res: Response): Promise<void> => {
  if (!config.XAMAN_API_KEY || !config.XAMAN_API_SECRET) {
    res.status(503).json({ error: "Xaman signing is not configured", code: "XAMAN_NOT_CONFIGURED" });
    return;
  }
  if (!allowXamanRequest(req.ip || "unknown")) {
    res.status(429).json({ error: "Too many Xaman payload requests; try again in one minute" });
    return;
  }
  try {
    const prepared = await prepareDirectMint(req.body?.recipient, req.body?.amountXrp);
    const payload = await fetchXaman("payload", {
      method: "POST",
      body: JSON.stringify({ txjson: prepared.xrplTransaction, options: { submit: true, expire: 5 } }),
    });
    res.json({ prepared, xaman: payload });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create Xaman payload" });
  }
});

router.get("/direct-mint/xaman/:uuid", async (req: Request, res: Response): Promise<void> => {
  if (!config.XAMAN_API_KEY || !config.XAMAN_API_SECRET) {
    res.status(503).json({ error: "Xaman signing is not configured", code: "XAMAN_NOT_CONFIGURED" });
    return;
  }
  const uuid = req.params.uuid;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
    res.status(400).json({ error: "Invalid Xaman payload UUID" });
    return;
  }
  try {
    const payload = await fetchXaman(`payload/${uuid}`) as {
      meta?: { resolved?: boolean; signed?: boolean; expired?: boolean; cancelled?: boolean };
      response?: { txid?: string; account?: string };
    };
    res.json({
      uuid,
      resolved: Boolean(payload.meta?.resolved),
      signed: Boolean(payload.meta?.signed),
      expired: Boolean(payload.meta?.expired),
      cancelled: Boolean(payload.meta?.cancelled),
      txid: payload.response?.txid || null,
      account: payload.response?.account || null,
    });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unable to fetch Xaman payload" });
  }
});

export default router;
