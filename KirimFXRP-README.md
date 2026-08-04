# 🇮🇩 KirimFXRP — Trustless Remittance Rail Powered by FXRP & FTSO v2

> **Flare Summer Signal Hackathon Submission — Bounty: Make Assets More Useful Across Flare**
> *Cross-border remittance that replaces custodial money-transfer operators with a trustless FAssets settlement rail.*

---

## 📌 Executive Summary

Indonesian migrant workers sent home **US$17.25 billion in 2025** (Bank Indonesia). Traditional remittance rails (Western Union, bank wires, informal agents) charge 5–10% in fees and FX markups, and settlement can take 1–3 days. Malaysia, Taiwan, Hong Kong, and Saudi Arabia alone account for over 80% of this flow — a small number of concentrated corridors, which makes this a tractable first market rather than an abstract "global" claim.

**KirimFXRP** replaces the custodial middleman with a trustless settlement rail: senders convert XRP to **FXRP** via Flare's FAssets protocol, get a transparent live FX rate from **FTSO v2**, and recipients receive funds in seconds instead of days.

**Beachhead → expansion path:** the corridor we demo (e.g. Taiwan/Malaysia → Indonesia) is the proof point. The same rail is corridor-agnostic — the roadmap section below shows how it extends to other large remittance markets (Philippines, Vietnam) without re-architecting anything, since the core primitive is FXRP + FTSO, not anything Indonesia-specific.

---

## 🎯 Target User

**Primary:** Indonesian migrant workers (TKI) in Malaysia, Taiwan, Hong Kong, or Saudi Arabia who already hold or are willing to acquire XRP, sending money home regularly (weekly/monthly).

**Secondary:** Recipient family members in Indonesia — the product must work for them even with zero crypto literacy.

---

## ✅ Core MVP Scope (must work live in the demo)

This is the part that decides whether we win. Everything here must run end-to-end on Coston2 testnet, no mocks.

| # | Feature | Why it's core |
|---|---|---|
| 1 | **XRP → FXRP onboarding** | Sender connects wallet, mints/deposits FXRP via FAssets. This *is* the Flare integration — without it there's no product. |
| 2 | **Live FX rate via FTSO v2** | Pull real XRP/USD and USD/IDR feeds on-chain, show sender the exact IDR value they're sending vs. what a bank/Western Union would charge — real comparison, not a static number. |
| 3 | **Instant send** | Sender dispatches FXRP to recipient's address; settlement confirmed in seconds on Coston2. |
| 4 | **Recipient dashboard** | Non-technical view: balance in IDR-equivalent (converted live via FTSO), transaction history, no wallet jargon exposed. |

If these four work cleanly and fast in a live demo, that alone satisfies **product usefulness**, **Flare integration quality**, and **technical execution** — the three heaviest criteria.

---

## 🧪 Demo-able Stretch (build if time allows, clearly labeled as simulation)

| Feature | Status in submission |
|---|---|
| **QRIS scan-and-pay at merchants** | Simulated UI flow showing how a recipient *would* pay a warung directly with FXRP balance. Explicitly labeled: "simulated — live integration requires partnership with a licensed PJP under Bank Indonesia regulation." |
| **FDC-based settlement attestation** | Explained in architecture docs as the mechanism that *would* verify QRIS payment finality trustlessly. Not required to be live for the demo to be credible — judges reward honest scoping over overclaimed features that break under questions. |

We are deliberately not building custodial vaults, yield features, or IDR-stablecoin mechanics for this submission — they add DeFi surface area that isn't necessary to prove the core thesis and would dilute focus away from what actually needs to work.

---

## 🛠️ Flare Integration Detail

| Flare Component | Role in KirimFXRP | Depth of use |
|---|---|---|
| **FAssets (FXRP)** | Trustless bridge — sender's XRP becomes usable, transferable FXRP on Flare without a custodial exchange. | Core, load-bearing |
| **FTSO v2** | On-chain, real-time XRP/USD and USD/IDR feeds power the rate shown to both sender and recipient. This is what makes the "we're cheaper and more transparent than Western Union" claim provable, not just marketing copy. | Core, load-bearing |
| **FDC (Flare Data Connector)** | Roadmap component for attesting off-chain QRIS settlement finality. Documented in architecture, not required in the live demo. | Roadmap |

---

## 📐 System Architecture (MVP)

```
[Sender Wallet: XRP]
        │  mint/deposit
        ▼
[FAssets Bridge] ──► [FXRP on Flare / Coston2]
        │
        │  read live rate
        ▼
[FTSO v2 Price Feed: XRP/USD, USD/IDR]
        │
        ▼
[Send Contract] ──► [Recipient Wallet: FXRP balance]
        │
        ▼
[Recipient Dashboard: IDR-equivalent balance + history]
```

QRIS/FDC layer sits *after* this, documented as Phase 2 in the roadmap — not drawn into the core diagram, to keep the architecture honest about what's actually built.

---

## 🆕 What Was Newly Built During the Hackathon

Be explicit here — this is its own judging criterion.

- FXRP onboarding flow (wallet connect → mint → deposit) — built from scratch
- FTSO v2 integration for live dual-rate display (XRP/USD + USD/IDR) — built from scratch
- Send contract and recipient dashboard UX — built from scratch
- QRIS simulation UI and FDC architecture design — designed during hackathon, not implemented live (explicitly disclosed)

Nothing in this submission is a pre-existing product being re-skinned; the whole rail is new.

---

## 🗺️ Roadmap Beyond the Hackathon

1. **Corridor expansion** — same FXRP + FTSO rail, no re-architecture needed, extend to Philippines and Vietnam remittance corridors.
2. **QRIS merchant integration** — partner with a licensed PJP to make the simulated scan-and-pay flow real, using FDC for trustless settlement attestation.
3. **Compliance layer** — KYC/AML integration appropriate for regulated remittance in Indonesia.
4. **Multi-asset support** — extend beyond FXRP to other FAssets as they launch.

---

## 🏆 Why This Wins on Each Criterion

- **Product usefulness:** real, sourced problem ($17.25B/year, verifiable, concentrated in 4 corridors)
- **Flare integration quality:** FXRP and FTSO v2 are load-bearing, not decorative — remove either and the product breaks
- **Technical execution:** small, achievable, live-demoable scope — no untestable claims
- **Evidence of new work:** everything in the MVP is built during the program, clearly itemized
- **Clarity & future potential:** one clean corridor proven live, explicit low-risk path to more corridors and to real QRIS integration
