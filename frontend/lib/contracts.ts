// ─── Contract Addresses ───────────────────────────────────────────────────────
// These are filled after deploying contracts in Fase 1.
// Update these values from the forge deploy script output.

export const CONTRACT_ADDRESSES = {
  // FXRP ERC-20 token on Coston2 — from faucet.flare.network/coston2
  FXRP: (process.env.NEXT_PUBLIC_FXRP_ADDRESS ||
    "0x0b6A3645c240605887a5532109323A3E12273dc7") as `0x${string}`,

  // Deployed by Deploy.s.sol
  RATE_READER: (process.env.NEXT_PUBLIC_RATE_READER_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  SEND_CONTRACT: (process.env.NEXT_PUBLIC_SEND_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,

  MERCHANT_PAYMENT: (process.env.NEXT_PUBLIC_MERCHANT_PAYMENT_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function isContractConfigured(address: string): boolean {
  return address !== ZERO_ADDRESS;
}

// ─── RateReader ABI ───────────────────────────────────────────────────────────
export const RATE_READER_ABI = [
  {
    name: "getXrpUsdRate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "decimals", type: "int8" },
      { name: "timestamp", type: "uint64" },
    ],
  },
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
  {
    name: "XRP_USD_FEED_ID",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes21" }],
  },
] as const;

// ─── SendContract ABI ─────────────────────────────────────────────────────────
export const SEND_CONTRACT_ABI = [
  {
    name: "send",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getFxrpBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "getAllowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "allowance", type: "uint256" }],
  },
  {
    name: "totalVolume",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalTransactions",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "Sent",
    type: "event",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── ERC-20 ABI (minimal — for FXRP approve + balanceOf) ─────────────────────
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const MERCHANT_PAYMENT_ABI = [
  {
    name: "payMerchant",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "paymentId", type: "bytes32" },
      { name: "merchant", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "idrQuote", type: "uint256" },
      { name: "merchantReferenceHash", type: "bytes32" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getPayment",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "paymentId", type: "bytes32" }],
    outputs: [{
      name: "",
      type: "tuple",
      components: [
        { name: "payer", type: "address" },
        { name: "merchant", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "idrQuote", type: "uint256" },
        { name: "merchantReferenceHash", type: "bytes32" },
        { name: "deadline", type: "uint256" },
        { name: "timestamp", type: "uint256" },
      ],
    }],
  },
] as const;

// ─── FXRP Decimals ────────────────────────────────────────────────────────────
export const FXRP_DECIMALS = 6;

// ─── Explorer URL Helper ──────────────────────────────────────────────────────
export const EXPLORER_BASE = "https://coston2-explorer.flare.network";

export function getTxExplorerUrl(txHash: string): string {
  return `${EXPLORER_BASE}/tx/${txHash}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}`;
}
