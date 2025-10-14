# Fix Recharts Dependency Script
# This script will clean and reinstall npm dependencies

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Fix Recharts Dependency Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\itp\Hospital-Management-System\frontend"

Write-Host "[1/5] Removing node_modules directory..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Done!" -ForegroundColor Green
} else {
    Write-Host "   Directory not found, skipping..." -ForegroundColor Gray
}
Write-Host ""

Write-Host "[2/5] Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "   Done!" -ForegroundColor Green
} else {
    Write-Host "   File not found, skipping..." -ForegroundColor Gray
}
Write-Host ""

Write-Host "[3/5] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Installing all dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Done!" -ForegroundColor Green
} else {
    Write-Host "   Warning: Installation completed with warnings" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[5/5] Verifying recharts installation..." -ForegroundColor Yellow
npm list recharts
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open your browser to test the dashboard" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
