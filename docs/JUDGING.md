# FlareIt Judging Map

## Product Usefulness

**User:** an XRP holder who wants to use XRP in EVM payments, plus a recipient or merchant who needs verifiable delivery.

**Problem:** FAssets direct minting is powerful but protocol-oriented; moving from an XRPL payment to usable FXRP, then proving receipt, spans two networks and several transaction states.

**Product answer:** FlareIt turns that protocol journey into one guided UX and adds two immediate uses for the resulting asset: person-to-person transfer and merchant payment.

## Flare Integration Quality

Flare is the execution substrate, not a badge:

- FAssets/FDC moves value from XRPL into FTestXRP.
- AssetManagerFXRP is queried at runtime; the Core Vault and fees are not hardcoded.
- FTSO v2 provides the on-chain XRP/USD leg and stale data fails closed.
- Coston2 contracts execute non-custodial transfer and merchant payment.
- Coston2 events, balances, blocks, and receipts form the evidence layer.

## Technical Execution

The credible demo path is deliberately narrow:

1. Xaman-signed direct mint preparation and XRPL transaction hash.
2. FTestXRP balance increase on Coston2.
3. Separate approval and send receipts.
4. Gap-free event indexing and recipient history.
5. Expiring merchant quote, on-chain deadline enforcement, and merchant receipt.

Failure behavior is visible: zero custom addresses disable writes, wrong networks trigger switching, stale FTSO data returns `503`, and expired invoices revert.

## Evidence of New Work

The submission includes new contracts, deployment scripts, backend routes, indexer recovery, Xaman lifecycle handling, merchant UX, tests, and evidence templates. The file-by-file map is in `NEW_WORK.md`; reproducible command and explorer evidence is in `README.md` and `evidence-runs.md`.

## Clarity and Future Potential

The hackathon MVP ends at verifiable FXRP merchant receipt. It does not claim production QRIS or Rupiah settlement.

The commercial path is an adapter around the Web3 core: partner with a licensed PJP/acquirer, bind its merchant reference to the on-chain payment ID, verify signed settlement webhooks, and add reconciliation/refunds. This preserves non-custodial asset movement while giving merchants a credible IDR path.

## Judge Demo Checklist

- Show the live Core Vault and direct-mint memo.
- Show one XRPL transaction and resulting FTestXRP balance.
- Show approval and send as separate explorer receipts.
- Show the recipient event in the dashboard.
- Show FTSO source labels and the absence of mock fallback prices.
- Show invoice expiry enforced in both UI and contract test.
- State the PJP boundary in one sentence; do not spend demo time presenting roadmap as shipped functionality.
