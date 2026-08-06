import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

// ─── Flare Coston2 Testnet Chain Definition ───────────────────────────────────
export const coston2 = defineChain({
  id: 114,
  name: "Flare Coston2",
  nativeCurrency: {
    decimals: 18,
    name: "Coston2 FLR",
    symbol: "C2FLR",
  },
  rpcUrls: {
    default: {
      http: ["https://coston2-api.flare.network/ext/C/rpc"],
    },
    public: {
      http: ["https://coston2-api.flare.network/ext/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
    },
  },
  testnet: true,
});

// ─── wagmi Config ─────────────────────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains: [coston2],
  connectors: [
    injected(), // Standard injected connector for EVM wallets (MetaMask, Rabby, Coinbase, etc.)
  ],
  transports: {
    [coston2.id]: http("https://coston2-api.flare.network/ext/C/rpc"),
  },
  ssr: true,
});

export default wagmiConfig;
