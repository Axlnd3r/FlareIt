# FlareIt Submission Evidence

FlareIt is a Coston2 testnet product for onboarding XRP into FAssets, sending FXRP, and paying a merchant address through a QR payment request.

## Evidence Status

| Requirement | Status | Evidence |
|---|---|---|
| FTestXRP protocol address | Verified | `0x0b6A3645c240605887a5532109323A3E12273dc7`, symbol `FTestXRP`, 6 decimals |
| AssetManagerFXRP | Verified | `0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA` on Coston2 |
| FTSO XRP/USD | Verified | 8/8 fork tests pass against the live Coston2 registry/feed |
| SendContract unit behavior | Verified | 12/12 Foundry unit tests pass |
| MerchantPayment contract | Verified locally | 6/6 Foundry unit tests pass, including on-chain quote expiry; Coston2 deployment pending |
| Backend packaging/API | Verified locally | TypeScript build and 4/4 Node rate/quote/API/migration tests pass |
| Direct mint preparation | Verified live | Backend reads Core Vault and current fees from AssetManager and builds the official 32-byte memo |
| Frontend | Verified locally | ESLint clean and Next.js production build passes for all routes |
| Custom contract deployment | Blocked | A valid funded deployer key is not configured |
| Xaman signing | Blocked | `XAMAN_API_KEY` and `XAMAN_API_SECRET` are not configured |
| Three recorded E2E runs | Not completed | Requires deployed contracts, Xaman signing, funded wallets, and recorded explorer links |
| Production QRIS settlement | Partner required | Requires a licensed PJP/acquirer; current QR settles FTestXRP only |

## Verified Commands

```text
contracts: forge fmt --check
contracts: forge test -vv
contracts: forge test --match-contract RateReaderTest --fork-url <COSTON2_RPC> -vv
backend:   npm test
frontend:  npm run lint
frontend:  npm run build
```

The dated command results and live read-only smoke test are recorded in `VALIDATION.md`.

## Submission Gate

Do not mark the project ready until `docs/evidence-runs.md` contains three complete runs with XRPL transaction, mint outcome/balance change, approval transaction, send transaction, recipient history, and merchant payment transaction.
