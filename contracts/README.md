# FlareIt Contracts

- `RateReader.sol`: XRP/USD reader using FtsoV2 resolved through the Flare Contract Registry.
- `SendContract.sol`: non-custodial FTestXRP transfer router with an indexed `Sent` event.
- `MerchantPayment.sol`: direct FTestXRP merchant payment with unique IDs and an on-chain quote deadline.

## Test

```powershell
forge fmt --check
forge test -vv
forge test --match-contract RateReaderTest --fork-url https://coston2-api.flare.network/ext/C/rpc -vv
```

## Deploy

Configure `PRIVATE_KEY` and the official FTestXRP address in `.env`, fund the deployer with C2FLR, then run:

```powershell
forge script script/Deploy.s.sol --rpc-url coston2 --broadcast -vvv
```

Never commit the private key. Record addresses, deployment block, transaction hashes, and explorer verification in `../docs/evidence-runs.md`.
