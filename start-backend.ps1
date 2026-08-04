# FlareIt — Start Backend Server
# Run from root: .\start-backend.ps1

$env:PATH = "C:\Users\HP\.foundry\bin;$env:PATH"

Write-Host "Starting FlareIt Backend..." -ForegroundColor Cyan
Write-Host "Network: Flare Coston2 (Chain ID 114)" -ForegroundColor Gray
Write-Host "URL: http://localhost:3001" -ForegroundColor Gray
Write-Host ""

Push-Location backend
npm run dev
Pop-Location
