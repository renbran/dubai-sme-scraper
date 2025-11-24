# HR Outsourcing Campaign Launcher - PowerShell
# Quick launcher for Apify-powered campaign

Write-Host "`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   HR OUTSOURCING CAMPAIGN - APIFY LAUNCHER" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if APIFY_TOKEN is set
if (-not $env:APIFY_TOKEN) {
    Write-Host " [ERROR] APIFY_TOKEN environment variable not set!`n" -ForegroundColor Red
    Write-Host " Please set your Apify API token first:" -ForegroundColor Yellow
    Write-Host '   $env:APIFY_TOKEN = "apify_api_YOUR_TOKEN_HERE"' -ForegroundColor White
    Write-Host "`n Or get one at: https://console.apify.com/account/integrations`n" -ForegroundColor Yellow
    exit 1
}

Write-Host " [OK] APIFY_TOKEN is set" -ForegroundColor Green
Write-Host ""
Write-Host " Target: Construction, Electromechanical, Packaging companies" -ForegroundColor White
Write-Host " Areas: Business Bay, JVC, JLT, Downtown, DIFC" -ForegroundColor White
Write-Host " Queries: 18 targeted searches" -ForegroundColor White
Write-Host " Expected: 100-300 qualified leads with phone numbers" -ForegroundColor White
Write-Host " Duration: 15-30 minutes" -ForegroundColor White
Write-Host ""
Write-Host " Starting campaign..." -ForegroundColor Yellow
Write-Host ""

node scripts/campaigns/apify-hr-outsourcing.js

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Campaign finished! Check results folder for output files." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
