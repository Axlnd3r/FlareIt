# FlareIt — Start Frontend Dev Server
# Run from root: .\start-frontend.ps1

$env:PATH = "C:\Users\HP\.foundry\bin;$env:PATH"

Write-Host "Starting FlareIt Next.js 14 Frontend..." -ForegroundColor Cyan
Write-Host "Theme: Flare Crimson Dark Mode" -ForegroundColor Crimson
Write-Host "URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Push-Location frontend
npm run dev
Pop-Location
