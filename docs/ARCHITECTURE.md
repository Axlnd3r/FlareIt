# FlareIt — Architecture Documentation

> **Project**: FlareIt (KirimFXRP) — Trustless Remittance Rail on Flare Coston2
> **Hackathon**: Flare Summer Signal — Track: Interoperable Asset Products
> **Network**: Flare Coston2 Testnet (Chain ID: 114)

---

## 📍 Official Contract Addresses (Coston2 Testnet)

> ⚠️ All addresses below are sourced directly from official Flare documentation and block explorer. Never assumed.

| Contract | Address | Source |
|---|---|---|
| **FXRP Token (ERC-20)** | `TBD — verify at faucet.flare.network/coston2` | [Coston2 Faucet](https://faucet.flare.network/coston2) |
| **ContractRegistry** | `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019` | [dev.flare.network](https://dev.flare.network) |
| **FTSO v2 (via Registry)** | Auto-resolved via `ContractRegistry.getTestFtsoV2()` | [FTSO Docs](https://dev.flare.network/ftso/getting-started) |
| **RateReader.sol** (deployed) | `TBD — fill after Fase 1 deploy` | Coston2 Explorer |
| **SendContract.sol** (deployed) | `TBD — fill after Fase 1 deploy` | Coston2 Explorer |

---

## 🏗️ System Architecture (MVP Core)

```
┌─────────────────────────────────────────────────────────┐
│                   SENDER (TKI di Luar Negeri)           │
│   Wallet: MetaMask connected to Coston2 (Chain ID 114)  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  1. Acquire FXRP
                         ▼
┌─────────────────────────────────────────────────────────┐
│               FXRP Onboarding                           │
│   Coston2 Faucet → FXRP ERC-20 Token on Coston2        │
│   (Testnet: direct faucet claim)                        │
│   (Mainnet roadmap: mint from XRP via FAssets bridge)   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  2. Read Live FX Rate
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   FTSO v2 Price Feed                    │
│   RateReader.sol reads:                                 │
│   - XRP/USD (on-chain, from FTSO v2 — real-time)        │
│   - IDR/USD (off-chain via CoinGecko API — labeled)     │
│   Derived: XRP/IDR = XRP/USD × USD/IDR                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  3. Send FXRP
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SendContract.sol                       │
│   - Accepts FXRP ERC-20 transfer from sender            │
│   - Forwards to recipient address                       │
│   - Emits Sent(sender, recipient, amount, timestamp)    │
└────────────────────────┬────────────────────────────────┘
                         │
                    Event indexed by
                    Backend (viem watchContractEvent)
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              RECIPIENT (Keluarga di Indonesia)          │
│   Dashboard: saldo FXRP + IDR-equivalent + histori      │
│   No crypto jargon exposed                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔬 FTSO v2 Integration Details

### XRP/USD (On-Chain — REAL)
- Feed ID: `0x015852502f55534400000000000000000000000000` (XRP/USD)
- Source: FTSO v2 block-latency feed on Coston2
- Read via: `ContractRegistry.getTestFtsoV2().getFeedById(feedId)`
- Update frequency: ~1.8 seconds (block-latency)
- **This is the real, on-chain, trustless rate**

### IDR Rate (Off-Chain — CLEARLY LABELED)
- Source: CoinGecko API (`/simple/price?ids=ripple&vs_currencies=idr`)
- Backend caches this, refreshes every 60 seconds
- UI displays: "IDR rate via CoinGecko (off-chain reference rate)"
- **Honest disclosure**: FTSO v2 does not currently have an IDR feed. We use an off-chain reference rate for IDR display only. The core settlement is in FXRP — IDR display is informational.

---

## 🔄 Backend Event Indexing

```
Coston2 Node (WebSocket)
    │
    │  watchContractEvent (viem)
    ▼
eventListener.ts
    │
    │  INSERT
    ▼
SQLite (transactions table)
    │
    │  GET /api/transactions/:address
    ▼
Frontend TransactionHistory component
```

---

## 🚧 QRIS / FDC Roadmap (Phase 2 — Post-Hackathon)

> This section documents the DESIGNED architecture for QRIS merchant payments. It is NOT live in this submission. The QRIS section in the UI is clearly labeled "Demo Simulation."

### Planned Flow (Not Live)
1. Recipient scans merchant QR code at warung
2. FlareIt sends FXRP amount → PJP partner converts to IDR on their rails
3. PJP partner posts settlement confirmation to off-chain API
4. **Flare Data Connector (FDC)** attests that settlement occurred:
   - FDC validator set reads PJP API response
   - Attestation written on-chain via FDC protocol
5. `QrisSettlement.sol` checks FDC attestation before releasing funds
   - Trustless finality: no single party can fake a settlement

### Why This Requires Post-Hackathon Work
- Real QRIS requires licensed PJP (Payment Service Provider) partnership under Bank Indonesia regulation — not achievable during hackathon timeline
- FDC integration requires registering an attestation type with Flare's validator set
- Both are on the roadmap with concrete next steps documented

---

## 📦 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Smart Contracts | Solidity ^0.8.20, Foundry | Blueprint spec; Foundry for fast testing with fork |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3, wagmi v2, viem | Blueprint spec; wagmi for wallet + contract interaction |
| Backend | Node.js, Express, TypeScript, viem, better-sqlite3 | Lightweight; SQLite = zero-config for demo |
| Chain | Flare Coston2 Testnet (Chain ID 114) | Required for FAssets/FTSO testnet |
