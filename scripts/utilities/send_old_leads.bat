@echo off
cls
echo ========================================
echo SEND OLD LEADS TO ODOO CRM
echo ========================================
echo.
echo Target: scholarixglobal.com
echo Webhook: /web/hook/1342d838-a97c-466c-99f1-8ae3222f38ce
echo.
echo This will send leads from your last 2 CSV files
echo to your Odoo CRM via webhook.
echo.
echo Processing...
echo ========================================
echo.
python send_old_leads.py
pause