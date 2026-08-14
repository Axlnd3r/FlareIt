# Evidence of New Work

This document separates newly built submission work from external protocol infrastructure.

| Area | New work in FlareIt | Evidence |
|---|---|---|
| FAssets onboarding | Runtime AssetManager reads, fee breakdown, official memo builder, Xaman payload/status UX | `backend/src/routes/fassets.ts`, `frontend/app/onboarding/page.tsx`, backend tests |
| Asset movement | Non-custodial `SendContract`, explicit approval/send states, explorer receipts | `contracts/src/SendContract.sol`, `frontend/components/SendForm.tsx`, 12 unit tests |
| Recipient proof | Chunked gap-free indexer, persistent cursor, event idempotency, legacy DB migration | `backend/src/indexer/eventListener.ts`, `backend/src/db/database.ts`, migration test |
| Rate integrity | Registry-backed RateReader, direct FtsoV2 fallback, stale/zero rejection, labeled off-chain IDR leg | `contracts/src/RateReader.sol`, `backend/src/routes/rate.ts`, 8 fork tests |
| Asset utility | Expiring IDR-denominated FXRP invoice and direct merchant settlement | `contracts/src/MerchantPayment.sol`, `backend/src/routes/payments.ts`, `frontend/components/MerchantPaymentQR.tsx`, 6 unit tests |
| Submission evidence | Build status, judging map, architecture, demo script, and three-run explorer matrix | `docs/` |

External components—XRPL, Xaman, FAssets, FDC, FTSO, and Coston2—are integrated, not claimed as work created by this team.

## Reproducibility

Run the commands in the root `README.md`. Do not replace local test evidence with unsupported PASS claims, and do not mark an E2E row complete without its explorer-verifiable hashes.
