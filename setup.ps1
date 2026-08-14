# FlareIt — Quick Start Guide
# Run this script from the root: e:\HACKATHON\FLARE\

# Add Foundry to PATH (persistent for this session)
$env:PATH = "C:\Users\HP\.foundry\bin;$env:PATH"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "1"

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     FlareIt — Development Setup      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan

# Check tools
Write-Host "`n[1/4] Checking tools..." -ForegroundColor Yellow
forge --version 2>$null && Write-Host "  ✓ Foundry installed" -ForegroundColor Green
node --version && Write-Host "  ✓ Node.js installed" -ForegroundColor Green

# Check contracts compiled
Write-Host "`n[2/4] Building contracts..." -ForegroundColor Yellow
Push-Location contracts
forge build 2>&1 | Select-Object -Last 3
if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ Contracts compiled" -ForegroundColor Green }
else { Write-Host "  ✗ Contract build failed!" -ForegroundColor Red }
Pop-Location

# Run all contract tests
Write-Host "`n[3/4] Running unit tests..." -ForegroundColor Yellow
Push-Location contracts
forge test 2>&1 | Select-Object -Last 12
Pop-Location

# Check backend
Write-Host "`n[4/4] Backend ready check..." -ForegroundColor Yellow
Push-Location backend
if (Test-Path "node_modules") {
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  Installing backend deps..." -ForegroundColor Yellow
    npm install
}
Pop-Location

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Next Steps                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host @"

1. DEPLOY CONTRACTS (requires wallet private key + C2FLR):
   cd contracts
   `$env:PRIVATE_KEY = "your_private_key_here"
   `$env:FXRP_ADDRESS = "fxrp_token_address_from_faucet"
   forge script script/Deploy.s.sol --rpc-url coston2 --broadcast -vvv

2. UPDATE .env FILES:
   - backend/.env (SEND_CONTRACT_ADDRESS, RATE_READER_ADDRESS, MERCHANT_PAYMENT_ADDRESS)
   - backend/.env (INDEXER_START_BLOCK = SendContract deployment block)
   - frontend/.env.local (NEXT_PUBLIC_ versions of all three custom contracts)

3. START BACKEND:
   cd backend
   npm run dev

4. START FRONTEND:
   cd frontend
   npm run dev

5. GET TESTNET FUNDS:
   - C2FLR: https://faucet.flare.network/coston2
   - XRP Testnet: https://faucet.altnet.rippletest.net/accounts
   - FTestXRP: use the FlareIt direct-mint flow
"@ -ForegroundColor White
