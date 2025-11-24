# HR OUTSOURCING CAMPAIGN - QUICK REFERENCE

## 🚀 Quick Start (3 Commands)

```powershell
# 1. Set Apify token (get from https://console.apify.com/account/integrations)
$env:APIFY_TOKEN = "apify_api_YOUR_TOKEN_HERE"

# 2. Run campaign
node scripts/campaigns/apify-hr-outsourcing.js

# 3. View results
ii results\apify-hr-outsourcing-*.csv
```

## 📋 What You Get

- **100-300 qualified leads** with phone numbers
- **Priority scoring**: URGENT / HIGH / MEDIUM
- **Target profile**: Construction, Electromechanical, Packaging
- **Locations**: Business Bay, JVC, JLT, Downtown, DIFC
- **Duration**: 15-30 minutes
- **Cost**: FREE (within 100 hours/month)

## 📁 Files Created

| File | Purpose |
|------|---------|
| `apify-inputs/hr-outsourcing-campaign.json` | 18 search queries configuration |
| `scripts/campaigns/apify-hr-outsourcing.js` | Campaign runner script |
| `docs/guides/APIFY-HR-CAMPAIGN-GUIDE.md` | Complete guide |
| `launch-hr-campaign.ps1` | PowerShell launcher |
| `launch-hr-campaign.bat` | Windows batch launcher |

## 🎯 Lead Qualification

### Mandatory
- ✅ Phone number (must exist)

### Scoring (0-100 points)
- 30 pts: Has phone
- 10 pts: Has name
- 10 pts: Has address
- 15 pts: Has website
- 10 pts: Rating 4.0+
- 10 pts: 10+ reviews
- 15 pts: Target location
- 10 pts: Target industry

### Priority Levels
- 🔴 **URGENT** (80+): Hot leads
- 🟠 **HIGH** (65-79): Strong leads
- 🟡 **MEDIUM** (50-64): Good leads
- ❌ **REJECTED** (<40 or no phone)

## 📊 Output Files

Results saved to `results/` folder:

### apify-hr-outsourcing-{timestamp}.json
- All scraped businesses (300-900)
- Qualified leads with scores
- Campaign statistics
- Apify run metadata

### apify-hr-outsourcing-{timestamp}.csv
Columns:
- Name, Phone, Address, Website, Category
- Rating, Reviews
- Priority, Score, Flags
- Latitude, Longitude, Source Query

## 🔧 Customization

### Change search queries
Edit `apify-inputs/hr-outsourcing-campaign.json`:
```json
{
  "categories": ["your search terms here"],
  "maxResultsPerCategory": 50
}
```

### Adjust scoring
Edit `scripts/campaigns/apify-hr-outsourcing.js` → `qualifyLead()` function

### Change mandatory requirements
In `qualifyLead()`, modify:
```javascript
// Current: Phone is mandatory
const hasPhone = business.phone && ...

// Example: Make website mandatory too
const hasWebsite = business.website && ...
if (!hasPhone || !hasWebsite) return { qualified: false }
```

## 🔄 Next Steps

### 1. Review Results
```powershell
# Open CSV in Excel
ii results\apify-hr-outsourcing-*.csv

# View JSON
code results\apify-hr-outsourcing-*.json
```

### 2. Import to Odoo
```bash
python odoo-integration/bulk_import_leads.py results/apify-hr-outsourcing-*.json
```

### 3. Filter Top Priorities
```bash
# Get URGENT priority leads only
node scripts/utilities/filter-urgent-leads.js results/apify-hr-outsourcing-*.json
```

## ❓ Troubleshooting

### "APIFY_TOKEN not set"
```powershell
# Set token first
$env:APIFY_TOKEN = "apify_api_YOUR_TOKEN"
```

### "Actor run failed"
- Check https://console.apify.com/actors/runs
- View logs for details
- Common: Quota exceeded (100 hours/month limit)

### "No qualified leads"
- All businesses missing phone numbers
- Lower score threshold from 40 to 30
- Remove mandatory phone requirement

### Test with smaller dataset
```json
// Change in apify-inputs/hr-outsourcing-campaign.json
"maxResultsPerCategory": 10  // Instead of 50
```

## 💰 Cost Estimate

| Item | Free Tier | This Campaign |
|------|-----------|---------------|
| Hours included | 100/month | ~0.5 hours |
| Campaigns possible | ~200/month | 1 campaign |
| Cost if exceeding | $49/month | ~$0.05 |

## 📖 Full Documentation

- **Setup Guide**: `docs/guides/APIFY-HR-CAMPAIGN-GUIDE.md`
- **Apify Docs**: https://docs.apify.com
- **Google Maps Scraper**: https://apify.com/compass/crawler-google-places

## 🆘 Support

- **Apify Console**: https://console.apify.com
- **API Documentation**: https://docs.apify.com/api/client/js
- **Community**: https://community.apify.com

---

**Ready to start?** 

1. Get your token: https://console.apify.com/account/integrations
2. Run: `.\launch-hr-campaign.ps1`
3. Wait 15-30 minutes
4. Check `results/` folder
