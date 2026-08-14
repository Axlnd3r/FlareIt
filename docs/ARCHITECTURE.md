# FlareIt Architecture

## Network And Protocol Contracts

| Component | Coston2 address | Status |
|---|---|---|
| Contract Registry | `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019` | Official |
| FtsoV2 | `0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d` | Resolved from registry |
| AssetManagerFXRP | `0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA` | Official FAssets testnet contract |
| FTestXRP | `0x0b6A3645c240605887a5532109323A3E12273dc7` | Official testnet FXRP token |
| RateReader | Pending deployment | Custom FlareIt contract |
| SendContract | Pending deployment | Custom FlareIt contract |
| MerchantPayment | Pending deployment | Expiring, non-custodial FXRP merchant invoice contract |

## Core Flow

```text
XRPL Testnet wallet
  -> Payment to Core Vault + DIRECT_MINTING memo
  -> FAssets executor finalizes on Coston2
  -> recipient receives FTestXRP
  -> approve SendContract
  -> SendContract.send(recipient, amount)
  -> Sent event
  -> backend historical/live indexer
  -> recipient dashboard
```

The backend reads `directMintingPaymentAddress`, minimum fee, fee BIPS, and executor fee from AssetManager for every direct-mint preparation. It does not hardcode the Core Vault destination.

## Rate Integrity

- XRP/USD: FTSO v2 on-chain. The backend uses deployed RateReader when configured, otherwise calls the official FtsoV2 contract directly.
- USD/IDR: CoinGecko off-chain reference.
- XRP/IDR: derived from the two sources above.
- When verified rate data is unavailable, the API returns `503`; the frontend does not invent a fallback price.

## Indexer Recovery

On a persistent Node host, the indexer starts at `INDEXER_START_BLOCK` for a fresh database, scans every block in configurable chunks, persists each processed range even when it contains no events, and uses `(tx_hash, log_index)` for event idempotency. The same polling loop performs backfill and live sync, eliminating the startup handoff gap. Set `INDEXER_START_BLOCK` to the SendContract deployment block.

The Vercel deployment is intentionally stateless: transaction history is decoded on demand from the Coston2 Blockscout logs API, while merchant invoice payloads are authenticated with an HMAC token. This removes the always-on process and filesystem assumptions that do not hold for serverless functions.

## Merchant Payment Boundary

`MerchantPayment.payMerchant` executes a direct FTestXRP `transferFrom` from payer to merchant and records a unique payment ID, IDR quote metadata, hashed merchant reference, and deadline. The same five-minute deadline is carried by the FlareIt URI and enforced on-chain.

This is not production QRIS. Bank Indonesia's QRIS rail requires processing through an authorized payment service provider/acquirer. A production phase needs a licensed PJP partnership, merchant onboarding, compliant IDR settlement, webhook verification, reconciliation, refunds, and security/compliance review. FDC integration is not claimed until a supported attestation source and on-chain verification exist.

## Deployment Outputs

After deployment, replace the pending rows with addresses, deployment blocks, transaction hashes, and explorer verification links. Synchronize the same values in:

- `contracts/.env`
- `backend/.env`
- `frontend/.env.local`
- `docs/evidence-runs.md`
