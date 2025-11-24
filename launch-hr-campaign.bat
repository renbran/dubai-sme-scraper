@echo off
REM HR Outsourcing Campaign Launcher - Windows Batch
REM Quick launcher for Apify-powered campaign

echo.
echo ================================================================================
echo    HR OUTSOURCING CAMPAIGN - APIFY LAUNCHER
echo ================================================================================
echo.

REM Check if APIFY_TOKEN is set
if "%APIFY_TOKEN%"=="" (
    echo [ERROR] APIFY_TOKEN environment variable not set!
    echo.
    echo Please set your Apify API token first:
    echo    set APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE
    echo.
    echo Or get one at: https://console.apify.com/account/integrations
    echo.
    pause
    exit /b 1
)

echo [OK] APIFY_TOKEN is set
echo.
echo Target: Construction, Electromechanical, Packaging companies
echo Areas: Business Bay, JVC, JLT, Downtown, DIFC
echo Queries: 18 targeted searches
echo Expected: 100-300 qualified leads with phone numbers
echo Duration: 15-30 minutes
echo.
echo Starting campaign...
echo.

node scripts\campaigns\apify-hr-outsourcing.js

echo.
echo ================================================================================
echo Campaign finished! Check results folder for output files.
echo ================================================================================
echo.
pause
