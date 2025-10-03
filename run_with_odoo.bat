@echo off
echo ========================================
echo Google Maps Scraper with Odoo 17 CRM
echo ========================================
echo.
echo Checking yesterday's performance...
python check_yesterday_run.py
echo.
echo Starting today's 1-hour scraping...
python google_maps_scraper.py
echo.
echo ========================================
echo Scraping completed!
echo ========================================
pause
