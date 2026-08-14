# FlareIt Build Status

## Core MVP

- [x] Read the live FAssets Core Vault and fees from AssetManagerFXRP.
- [x] Build the official 32-byte direct-mint memo.
- [x] Create Xaman signing payloads and receive live signing status.
- [x] Read FTestXRP balances on Coston2.
- [x] Approve and transfer through `SendContract`.
- [x] Index `Sent` events with gap-free block polling and restart recovery.
- [x] Create fail-closed, five-minute merchant quotes.
- [x] Enforce merchant quote expiry in `MerchantPayment`.
- [x] Show explorer-linked receipts and recipient history.

## Verified Engineering

- [x] 18 local Foundry unit tests pass.
- [x] 8 live Coston2 FTSO fork tests pass.
- [x] 4 backend build/API/migration tests pass.
- [x] Frontend ESLint, TypeScript, and production build pass.
- [x] Legacy database uniqueness migrates to `(tx_hash, log_index)`.
- [x] Invalid/stale FTSO prices fail closed rather than producing quotes.

## External Submission Gate

- [ ] Deploy `RateReader`, `SendContract`, and `MerchantPayment` with official FTestXRP.
- [ ] Set `INDEXER_START_BLOCK` to the `SendContract` deployment block.
- [ ] Verify contract source/bytecode and record explorer links.
- [ ] Configure Xaman credentials only on the backend.
- [ ] Fund Wallet A/B with C2FLR and direct-mint FTestXRP to Wallet A.
- [ ] Record three complete E2E runs in `evidence-runs.md`.
- [ ] Record the three-minute demo using `demo-script.md`.

No item in the external gate should be marked complete without a transaction hash or reproducible command result.

## Post-Hackathon Partner Track

- [ ] Select a licensed PJP/acquirer and obtain sandbox credentials.
- [ ] Add merchant onboarding, signed webhooks, reconciliation, and refunds.
- [ ] Define FXRP liquidity/off-ramp and merchant IDR settlement ownership.
- [ ] Complete KYC/AML, consumer protection, security, and legal review.
- [ ] Add custom FDC verification only after confirming a supported attestation source.
