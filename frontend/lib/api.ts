// ─── Backend API URL ──────────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Transaction {
  id: number;
  sender: string;
  recipient: string;
  amount: string;       // raw (smallest unit, 6 decimals)
  amountFxrp: string;   // human-readable FXRP
  txHash: string;
  blockNumber: number | null;
  createdAt: number;    // Unix timestamp
  direction: "sent" | "received";
}

export interface TransactionsResponse {
  address: string;
  count: number;
  transactions: Transaction[];
}

export interface RateData {
  xrpUsd: number;
  xrpIdr: number;
  usdIdr: number;
  ftsoTimestamp: number;
  cacheUpdatedAt: number;
  ftsoFeedFresh: boolean;
  sources: {
    xrpUsd: "ftso-v2-on-chain";
    usdIdr: "coingecko-off-chain";
    xrpIdr: "derived";
  };
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTransactions(address: string): Promise<TransactionsResponse> {
  return fetchJson<TransactionsResponse>(`${BACKEND_URL}/api/transactions/${address}`);
}

export async function fetchRate(): Promise<RateData> {
  return fetchJson<RateData>(`${BACKEND_URL}/api/rate`);
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

/** Format FXRP amount from raw (6 decimal) to display string */
export function formatFxrp(rawAmount: string | bigint, decimals = 4): string {
  const num = typeof rawAmount === "bigint" ? Number(rawAmount) : Number(rawAmount);
  return (num / 1_000_000).toFixed(decimals);
}

/** Format IDR amount with Rupiah locale */
export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format relative time (e.g., "3 menit lalu") */
export function formatRelativeTime(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTimestamp;

  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

/** Shorten address for display: 0x1234...5678 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}
