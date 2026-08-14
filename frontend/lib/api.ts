// Use the public override when frontend and API have different origins.
// Otherwise, keep browser requests same-origin and let Next.js proxy /api.
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

export interface Transaction {
  id: number;
  sender: string;
  recipient: string;
  amount: string;
  amountFxrp: string;
  txHash: string;
  blockNumber: number | null;
  createdAt: number;
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
    xrpUsd: "rate-reader-on-chain" | "ftso-v2-direct-on-chain";
    usdIdr: "coingecko-off-chain" | "coingecko-off-chain-stale-cache";
    xrpIdr: "derived";
  };
}

export interface DirectMintPreparation {
  network: string;
  mode: "fassets-direct-mint-memo";
  assetManager: string;
  fxrp: string;
  quote: {
    grossDrops: string;
    mintingFeeDrops: string;
    executorFeeDrops: string;
    estimatedNetFxrpDrops: string;
    feeBips: string;
  };
  xrplTransaction: {
    TransactionType: "Payment";
    Destination: string;
    Amount: string;
    Memos: Array<{ Memo: { MemoData: string } }>;
  };
  warning: string;
}

export interface XamanMintResponse {
  prepared: DirectMintPreparation;
  xaman: {
    uuid?: string;
    next?: { always?: string };
    refs?: { qr_png?: string; websocket_status?: string };
  };
}

export interface XamanMintStatus {
  uuid: string;
  resolved: boolean;
  signed: boolean;
  expired: boolean;
  cancelled: boolean;
  txid: string | null;
  account: string | null;
}

export interface MerchantPaymentQuote {
  mode: "fxrp-on-chain";
  settlementStatus: "fxrp-on-chain";
  fiatOffRampStatus: "licensed-partner-required";
  expiresAt: number;
  rate: RateData;
  contract: `0x${string}`;
  functionName: "payMerchant";
  merchantReference: string;
  params: {
    paymentId: `0x${string}`;
    merchant: `0x${string}`;
    amount: string;
    idrQuote: number;
    merchantReferenceHash: `0x${string}`;
    deadline: number;
  };
  qrPayload: string;
  disclaimer: string;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || `API request failed (${response.status})`);
  return body as T;
}

export function fetchTransactions(address: string): Promise<TransactionsResponse> {
  return fetchJson(`/api/transactions/${address}`);
}

export function fetchRate(): Promise<RateData> {
  return fetchJson("/api/rate");
}

export function prepareDirectMint(recipient: string, amountXrp: string): Promise<DirectMintPreparation> {
  return fetchJson("/api/fassets/direct-mint/prepare", {
    method: "POST",
    body: JSON.stringify({ recipient, amountXrp }),
  });
}

export function createXamanMint(recipient: string, amountXrp: string): Promise<XamanMintResponse> {
  return fetchJson("/api/fassets/direct-mint/xaman", {
    method: "POST",
    body: JSON.stringify({ recipient, amountXrp }),
  });
}

export function fetchXamanMintStatus(uuid: string): Promise<XamanMintStatus> {
  return fetchJson(`/api/fassets/direct-mint/xaman/${uuid}`);
}

export function createMerchantPaymentQuote(
  merchant: string,
  amountIdr: number,
  merchantReference: string
): Promise<MerchantPaymentQuote> {
  return fetchJson("/api/payments/quote", {
    method: "POST",
    body: JSON.stringify({ merchant, amountIdr, merchantReference }),
  });
}

export function fetchMerchantPaymentQuote(paymentId: string): Promise<MerchantPaymentQuote> {
  return fetchJson(`/api/payments/quote/${paymentId}`);
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(unixTimestamp: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixTimestamp);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}
