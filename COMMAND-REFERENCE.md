# HR Outsourcing Campaign - Command Reference

## Setup (One-Time)

### Get Apify Account
1. Visit: https://apify.com
2. Sign up (free, no credit card)
3. Get token: https://console.apify.com/account/integrations

### Set Token
```powershell
# PowerShell
$env:APIFY_TOKEN = "apify_api_YOUR_TOKEN_HERE"
```

```cmd
# Command Prompt
set APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE
```

```bash
# Linux/Mac
export APIFY_TOKEN="apify_api_YOUR_TOKEN_HERE"
```

### Permanent Setup (Optional)
Create `.env` file:
```
APIFY_TOKEN=apify_api_YOUR_TOKEN_HERE
```

## Run Campaign

### Option 1: One-Click Launcher (Easiest)
```powershell
.\launch-hr-campaign.ps1
```

```cmd
launch-hr-campaign.bat
```

### Option 2: Direct Node Command
```bash
node scripts/campaigns/apify-hr-outsourcing.js
```

### Option 3: Test Mode (Faster, 10 results per query)
```bash
# Edit config first
code apify-inputs/hr-outsourcing-campaign.json
# Change "maxResultsPerCategory": 50 → 10
# Then run
node scripts/campaigns/apify-hr-outsourcing.js
```

## View Results

### Open CSV in Excel
```powershell
ii results\apify-hr-outsourcing-*.csv
```

### View JSON
```powershell
code results\apify-hr-outsourcing-*.json
```

### List All Results
```powershell
Get-ChildItem results\apify-hr-outsourcing-* | Format-Table Name, Length, LastWriteTime
```

## Customize Campaign

### Edit Search Queries
```bash
code apify-inputs/hr-outsourcing-campaign.json
```

### Edit Lead Qualification
```bash
code scripts/campaigns/apify-hr-outsourcing.js
# Find qualifyLead() function
```

### Change Target Locations
```json
// In apify-inputs/hr-outsourcing-campaign.json
{
  "categories": [
    "construction companies YOUR_LOCATION Dubai",
    "contractors YOUR_LOCATION Dubai"
  ]
}
```

## Import to Odoo

### Automatic Import
```bash
python odoo-integration/bulk_import_leads.py results/apify-hr-outsourcing-*.json
```

### Manual Import
1. Open Odoo CRM
2. Go to: CRM > Leads > Import
3. Upload CSV file
4. Map columns
5. Import

## Troubleshooting

### Check Token
```powershell
echo $env:APIFY_TOKEN
```

### View Apify Run Logs
Visit: https://console.apify.com/actors/runs

### Check Quota Usage
Visit: https://console.apify.com/account/usage

### Re-run Failed Campaign
```bash
# Campaign auto-saves progress
# Just run again, it will resume from last successful point
node scripts/campaigns/apify-hr-outsourcing.js
```

## Filter Results

### Get URGENT Priority Only
```bash
node scripts/utilities/filter-urgent-leads.js results/apify-hr-outsourcing-*.json
```

### Get High Priority Only
```bash
node scripts/utilities/filter-high-priority.js results/apify-hr-outsourcing-*.json
```

### Convert JSON to CSV (if needed)
```bash
node scripts/utilities/convert-to-csv.js results/apify-hr-outsourcing-*.json
```

## Documentation

### Quick Start Guide
```bash
code HR-CAMPAIGN-QUICK-START.md
```

### Full Setup Guide
```bash
code docs/guides/APIFY-HR-CAMPAIGN-GUIDE.md
```

### Configuration Reference
```bash
code apify-inputs/hr-outsourcing-campaign.json
```

## Monitoring

### Watch for Results
```powershell
# Keep checking results folder
while ($true) { 
    Get-ChildItem results\apify-hr-outsourcing-* | Select-Object -Last 1
    Start-Sleep -Seconds 60
}
```

### Check Campaign Status
Visit Apify console while running:
https://console.apify.com/actors/runs

## Common Tasks

### Run Multiple Campaigns
```bash
# Morning run
node scripts/campaigns/apify-hr-outsourcing.js

# Afternoon run (different areas)
# Edit config first, then:
node scripts/campaigns/apify-hr-outsourcing.js
```

### Merge Results
```bash
node scripts/utilities/merge-results.js results/apify-hr-outsourcing-*.json
```

### Export to Different Format
```bash
# To Excel
node scripts/utilities/export-to-excel.js results/apify-hr-outsourcing-*.json

# To Google Sheets
node scripts/utilities/export-to-sheets.js results/apify-hr-outsourcing-*.json
```

## Emergency Commands

### Kill Stuck Process
```powershell
Stop-Process -Name "node" -Force
```

### Clear Failed Runs
```bash
Remove-Item results\apify-hr-outsourcing-*-failed.json
```

### Reset Configuration
```bash
git checkout apify-inputs/hr-outsourcing-campaign.json
```

## Performance Tuning

### Faster (Less Results)
```json
{
  "maxResultsPerCategory": 20,
  "concurrency": {
    "maxConcurrency": 3
  }
}
```

### Slower (More Results)
```json
{
  "maxResultsPerCategory": 100,
  "concurrency": {
    "maxConcurrency": 1,
    "requestDelay": 5000
  }
}
```

---

**Most Common Usage:**
```powershell
# 1. Set token (once)
$env:APIFY_TOKEN = "apify_api_YOUR_TOKEN"

# 2. Run campaign
.\launch-hr-campaign.ps1

# 3. View results
ii results\apify-hr-outsourcing-*.csv
```
