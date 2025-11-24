# Quick Reference: Organized Results

## ⚡ TL;DR - What You Need

**MASTER_LEADS.csv** is your single source of truth.
- 917 leads from 2 campaigns
- Ready for CRM import
- Sort by Priority column for best leads first

## 📁 File Structure

```
results/
├── MASTER_LEADS.csv          ← USE THIS
├── MASTER_LEADS.json
├── CAMPAIGNS_SUMMARY.csv
└── campaigns/
    ├── campaign_2025-11-24T10-55-46/  (Construction - 500 leads)
    └── campaign_2025-11-24T12-14-47/  (Real Estate - 417 leads)
```

## 🚀 Common Tasks

### Import All Leads to CRM
```bash
python odoo-integration/bulk_import_leads.py results/MASTER_LEADS.csv
```

### After Each New Campaign
```bash
node scripts/utilities/organize-results.js
```
This updates MASTER_LEADS.csv automatically.

### View Campaign Overview
Open `results/CAMPAIGNS_SUMMARY.csv` in Excel/Google Sheets

### Focus on Best Leads
1. Open `results/MASTER_LEADS.csv`
2. Sort by "Priority" column
3. Filter for "HIGH" priority
4. Start calling!

## 📊 What's in MASTER_LEADS.csv?

| Column | Description |
|--------|-------------|
| Campaign Date | When scraped |
| Campaign Name | Campaign identifier |
| Business Name | Company name |
| Phone | ✅ 100% coverage |
| Email | Usually empty (Google Maps limitation) |
| Address | Full address |
| Website | Company URL |
| Priority | URGENT/HIGH/MEDIUM/LOW |
| Score | 0-100 quality score |

## 🎯 Priority Levels

- **HIGH**: Score 65-79 → Call first
- **MEDIUM**: Score 50-64 → Call second
- **LOW**: Score 40-49 → Call if time permits

## ❓ FAQ

**Q: Why organize results?**
A: Clean structure, master file for all leads, easy to track campaigns.

**Q: Can I delete old campaign folders?**
A: Yes, as long as MASTER_LEADS.csv is up to date.

**Q: How to avoid duplicate CRM imports?**
A: Import script checks phone numbers automatically.

**Q: Where are emails?**
A: Google Maps doesn't provide emails. See `EMAIL-EXTRACTION-GUIDE.md`.

## 📞 Next Steps

1. ✅ Results organized
2. → Import to CRM: `python odoo-integration/bulk_import_leads.py results/MASTER_LEADS.csv`
3. → Start calling HIGH priority leads
4. → Run new campaigns as needed

---

**Need details?** Read `results/README.md`
