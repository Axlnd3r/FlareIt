# FlareIt Frontend

Next.js interface for FAssets direct mint/Xaman status, FTestXRP transfers, recipient event history, and expiring FXRP merchant invoices on Coston2.

```powershell
npm install
npm run lint
npm run build
npm run dev
```

Copy `.env.example` to `.env.local` and fill custom deployment addresses. The UI disables contract writes when an address is zero or the wallet is not on chain ID 114.
