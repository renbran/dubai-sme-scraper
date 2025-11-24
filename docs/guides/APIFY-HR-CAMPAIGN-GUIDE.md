# Apify HR Outsourcing Campaign - Setup Guide

## Overview
This campaign uses Apify's infrastructure to scrape Google Maps without bot detection issues. Apify handles all anti-scraping measures professionally.

## Why Apify?
- ✅ **No bot detection** - Professional anti-bot handling
- ✅ **Proxy rotation** - Built-in proxy infrastructure
- ✅ **Reliable extraction** - Battle-tested scraping engine
- ✅ **No crashes** - Stable execution environment
- ✅ **Free tier available** - 100 actor hours/month free

## Quick Start (5 minutes)

### Step 1: Create Apify Account
1. Go to https://apify.com
2. Sign up for free account (100 hours/month free)
3. No credit card required for free tier

### Step 2: Get API Token
1. Go to https://console.apify.com/account/integrations
2. Copy your API token
3. Set environment variable:

**Windows PowerShell:**
```powershell
$env:APIFY_TOKEN = "apify_api_xxxxxxxxxxxxxx"
```

**Windows CMD:**
```cmd
set APIFY_TOKEN=apify_api_xxxxxxxxxxxxxx
```

**Linux/Mac:**
```bash
export APIFY_TOKEN="apify_api_xxxxxxxxxxxxxx"
```

**Or create .env file:**
```bash
echo "APIFY_TOKEN=apify_api_xxxxxxxxxxxxxx" > .env
```

### Step 3: Install Apify SDK
```bash
npm install apify-client
```

### Step 4: Run Campaign
```bash
node scripts/campaigns/apify-hr-outsourcing.js
```

## What This Campaign Does

### Target Profile
- **Company Size**: 50-1000 employees
- **Locations**: Business Bay, JVC, JLT, Downtown, DIFC, Dubai Marina
- **Industries**: Construction, Electromechanical, Packaging
- **Mandatory**: Phone number required

### Search Queries (18 total)
1. Construction companies Business Bay Dubai
2. Construction contractors Business Bay Dubai
3. Electromechanical companies Business Bay Dubai
4. MEP contractors Business Bay Dubai
5. Packaging companies Business Bay Dubai
6. Construction companies JVC Dubai
7. Construction contractors JVC Dubai
8. Electromechanical companies JVC Dubai
9. Construction companies JLT Dubai
10. Construction contractors JLT Dubai
11. Electromechanical companies JLT Dubai
12. Construction companies Downtown Dubai
13. Electromechanical contractors Downtown Dubai
14. Packaging manufacturers Dubai
15. Construction companies DIFC
16. Building contractors Dubai Marina
17. MEP companies Dubai
18. Building contractors Business Bay Dubai

### Expected Results
- **Duration**: 15-30 minutes
- **Total Businesses**: 300-900 (50 per query)
- **Qualified Leads**: 100-300 (with phone numbers)
- **Cost**: Free (within 100 hours/month limit)

## Lead Qualification

### Scoring System (0-100 points)
- **30 points**: Has phone number (MANDATORY)
- **10 points**: Has business name
- **10 points**: Has address
- **15 points**: Has website
- **10 points**: Rating 4.0+ stars
- **10 points**: 10+ reviews
- **15 points**: Target location (Business Bay, JVC, JLT)
- **10 points**: Target industry (Construction, Electromechanical, Packaging)

### Priority Levels
- **🔴 URGENT** (80+ points): Hot leads - target location + industry + complete info
- **🟠 HIGH** (65-79 points): Strong leads - most criteria met
- **🟡 MEDIUM** (50-64 points): Good leads - basic criteria met
- **⚪ LOW** (40-49 points): Acceptable leads - minimum requirements
- **❌ REJECTED** (<40 points or no phone): Does not meet criteria

## Output Files

### JSON File
`results/apify-hr-outsourcing-{timestamp}.json`

Contains:
- All scraped businesses (raw data)
- Qualified leads (enriched with scoring)
- Campaign statistics
- Apify run metadata

### CSV File
`results/apify-hr-outsourcing-{timestamp}.csv`

Columns:
- Name, Phone, Address, Website, Category
- Rating, Reviews
- Priority, Score, Flags
- Latitude, Longitude
- Source Query

## Next Steps After Campaign

### 1. Review Results
```powershell
# View CSV in Excel
ii results\apify-hr-outsourcing-*.csv

# View JSON
code results\apify-hr-outsourcing-*.json
```

### 2. Import to Odoo CRM
```bash
# Automatic webhook push (if configured)
python odoo-integration/bulk_import_leads.py results/apify-hr-outsourcing-*.json

# Or manual CSV import in Odoo
# CRM > Leads > Import > Upload CSV
```

### 3. Analyze Top Priorities
```bash
# Filter URGENT priority leads
node scripts/utilities/filter-urgent-leads.js results/apify-hr-outsourcing-*.json
```

## Troubleshooting

### "APIFY_TOKEN not set" Error
Set the environment variable before running:
```powershell
$env:APIFY_TOKEN = "your_token_here"
node scripts/campaigns/apify-hr-outsourcing.js
```

### "Actor run failed" Error
- Check Apify console: https://console.apify.com/actors/runs
- View run logs for details
- Common causes: Invalid input, quota exceeded, network issues

### "No qualified leads" Result
- Too strict filtering (mandatory phone requirement)
- Adjust scoring in `qualifyLead()` function
- Lower threshold from 40 to 30 points

### Free Tier Limits
- 100 actor hours/month
- This campaign uses ~0.5-1 hour
- Monitor usage: https://console.apify.com/account/usage

## Campaign Configuration

Edit `apify-inputs/hr-outsourcing-campaign.json` to customize:

```json
{
  "categories": ["your search queries here"],
  "maxResultsPerCategory": 50,
  "concurrency": {
    "maxConcurrency": 2,
    "requestDelay": 3000
  }
}
```

## Apify vs Local Scraping

| Feature | Local (Playwright) | Apify |
|---------|-------------------|-------|
| Bot Detection | ❌ Google blocks | ✅ Handles automatically |
| Stability | ❌ Frequent crashes | ✅ Reliable |
| Speed | ⚠️ Slow (15s delays) | ✅ Fast (3s delays) |
| Scalability | ❌ Limited | ✅ Highly scalable |
| Cost | Free | Free tier available |
| Setup Time | 5 minutes | 5 minutes |
| Success Rate | ~20% | ~95% |

## Support

- **Apify Documentation**: https://docs.apify.com
- **Google Maps Scraper**: https://apify.com/compass/crawler-google-places
- **API Reference**: https://docs.apify.com/api/client/js
- **Community Forum**: https://community.apify.com

## Estimated Costs (if exceeding free tier)

- **Free Tier**: 100 hours/month = ~200 campaigns/month
- **Paid Tier**: $49/month = 500 hours = ~1000 campaigns
- **This Campaign**: ~0.5 hours = $0.05 equivalent

For 100-200 qualified leads, this is extremely cost-effective compared to manual research or LinkedIn Sales Navigator ($80/month).
