# Validation Record

Date: 2026-08-10 (Asia/Jakarta)

## Reproducible Results

| Layer | Command | Result |
|---|---|---|
| Contracts | `forge fmt --check` | Pass |
| Contracts | `forge test -vv` | 18 passed, 0 failed; non-fork RateReader suite skipped by its network guard |
| Live Flare | `forge test --match-contract RateReaderTest --fork-url https://coston2-api.flare.network/ext/C/rpc -vv` | 8 passed, 0 failed |
| Backend | `npm test` | Build pass; 4 passed, 0 failed |
| Frontend | `npm run lint` | No warnings or errors |
| Frontend | `npx tsc --noEmit` | Pass |
| Frontend | `npm run build` | Pass; all application routes generated |

## Live Read-Only Smoke Test

The compiled backend queried Coston2 and the off-chain IDR reference without sending a transaction:

- AssetManager Core Vault: `rDhpmiPq4BVBDWMVdSrmkgt8thKyRzGV1p`
- Direct-mint memo length: 32 bytes
- 10 XRP gross quote estimated 9.8 FTestXRP net at the current minimum/executor fees
- FtsoV2 XRP/USD response was non-zero and fresh
- XRP/USD source label: `ftso-v2-direct-on-chain`
- USD/IDR source label: `coingecko-off-chain`

Rates are intentionally not frozen in this record because they change. Re-run the smoke test or `/api/rate` for the current value.

## Not Yet Evidence

Local tests and read-only calls do not prove custom-contract deployment or an end-to-end user payment. Those remain pending in `evidence-runs.md` until transaction hashes exist.
