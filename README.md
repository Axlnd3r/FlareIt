# FlareIt — Put XRP to Work on Flare

FlareIt turns idle XRP into usable FAssets through one verifiable journey: direct-mint XRP into FTestXRP, move it non-custodially on Coston2, and spend it through an expiring merchant invoice.

## The Problem

XRP holders can transfer value on XRPL, but using that value inside EVM applications still requires unfamiliar protocol steps. Recipients and merchants also need a simple way to verify that funds arrived without trusting an application database.

FlareIt packages those steps into a focused asset-utility product:

```text
XRPL Testnet XRP
  -> FAssets Core Vault direct mint
  -> FTestXRP in the user's Coston2 wallet
  -> SendContract transfer or MerchantPayment invoice
  -> explorer receipt and indexed recipient history
```

## Core MVP

1. **Onboard XRP:** read the live Core Vault and direct-mint fees from `AssetManagerFXRP`, build the official 32-byte memo, and sign the XRPL payment with Xaman.
2. **Move FXRP:** approve and send FTestXRP through `SendContract`; every transfer emits an indexed `Sent` event.
3. **Use FXRP:** pay an IDR-denominated merchant invoice in FTestXRP through `MerchantPayment`; the quote expires both in the UI and on-chain.
4. **Prove delivery:** show wallet balance, transaction receipt, block number, and indexed recipient history.

The merchant QR is a FlareIt payment URI, not a production QRIS code. A licensed PJP/acquirer is the explicit future adapter for IDR settlement.

## Why Flare Is Essential

| Flare infrastructure | Product responsibility |
|---|---|
| FAssets / FTestXRP | Brings XRP into the EVM and supplies the asset users move and spend |
| AssetManagerFXRP | Supplies the live Core Vault, minimum fee, proportional fee, and executor fee |
| FDC through FAssets | Proves the XRPL payment used by direct-mint finalization |
| FTSO v2 | Supplies fail-closed on-chain XRP/USD pricing for transparent estimates |
| Coston2 EVM | Executes non-custodial transfers and expiring merchant payments |

Without Flare, the onboarding proof, interoperable XRP representation, on-chain price source, contracts, and explorer evidence disappear; the product is not a superficial wallet skin.

## Architecture

```text
Xaman / XRPL wallet                  Injected Coston2 wallet
        |                                      |
        | signed XRP Payment                   | approve + write
        v                                      v
FAssets Core Vault -> FDC -> FTestXRP -> SendContract / MerchantPayment
                              |                    |
                              v                    v
                         wallet balance       on-chain receipts
                              |
                         Sent event indexer -> recipient dashboard

FTSO v2 XRP/USD ----+
CoinGecko USD/IDR ---+--> labeled estimates only; never custody or fiat settlement
```

See [architecture](docs/ARCHITECTURE.md), [judging map](docs/JUDGING.md), [new-work evidence](docs/NEW_WORK.md), and the [video demo + TTS production guide](docs/VIDEO_DEMO_GUIDE.md).

## Verified Local Evidence

- 18/18 Foundry unit tests pass.
- 8/8 RateReader tests pass on a live Coston2 fork.
- 4/4 backend build/API/migration tests pass.
- Frontend ESLint, TypeScript, and production build pass.
- Live AssetManager reads return the Coston2 Core Vault and current direct-mint fees.

Explorer-verifiable deployment and user-flow evidence stays marked pending until it actually exists. Track it in [evidence-runs.md](docs/evidence-runs.md).

## Run Locally

Requirements: Node.js 20+, npm, Foundry, an injected EVM wallet, and optional Xaman Developer credentials.

```powershell
cd contracts
forge fmt --check
forge test -vv
forge test --match-contract RateReaderTest --fork-url https://coston2-api.flare.network/ext/C/rpc -vv

cd ..\backend
Copy-Item .env.example .env
npm install
npm test
npm run dev

cd ..\frontend
Copy-Item .env.example .env.local
npm install
npm run lint
npm run build
npm run dev
```

Frontend: `http://localhost:3000`. Backend: `http://localhost:3001`.

The same-origin production proxy derives merchant invoice links from the browser's public origin. For a separate-origin setup, set `NEXT_PUBLIC_BACKEND_URL` to the public API origin and `FRONTEND_URL` to the public web origin so API CORS remains restricted correctly.

## Deploy the MVP

The live MVP runs on Vercel Hobby with free `vercel.app` domains:

- Web: [flareit-app.vercel.app](https://flareit-app.vercel.app)
- API health: [flareit-api.vercel.app/health](https://flareit-api.vercel.app/health)

The GitHub repository is connected to two Vercel projects with `frontend` and `backend` as their respective root directories. The web project proxies same-origin `/api` requests to the Express project. On Vercel, transaction history is read on demand from Coston2 Explorer and merchant invoices use signed stateless tokens, so neither feature depends on a persistent process or writable database.

Xaman credentials are intentionally not committed or uploaded by the deployment workflow. Add `XAMAN_API_KEY` and `XAMAN_API_SECRET` as sensitive Vercel environment variables only when the hosted Xaman signing flow is required. Manual direct-mint preparation remains available without them.

The repository still includes `render.yaml` as an optional persistent-host deployment. Persistent hosts run the local SQL.js indexer; Vercel uses the stateless explorer adapter instead.

Use the official Coston2 FTestXRP address, a locally configured deployer key, and a deployer funded with C2FLR:

```powershell
cd contracts
forge script script/Deploy.s.sol --rpc-url coston2 --broadcast -vvv
```

Synchronize `RateReader`, `SendContract`, `MerchantPayment`, and the `SendContract` deployment block into backend/frontend environment files. Never commit private keys or Xaman credentials.

## Path Beyond the Hackathon

The next milestone is a licensed off-ramp adapter: merchant onboarding, signed PJP webhooks, IDR reconciliation, refunds, compliance controls, and auditable linkage to the on-chain payment ID. The Web3 core remains non-custodial; regulated fiat settlement stays an explicit trust boundary.
