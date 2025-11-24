# Campaign Results Organization

This folder contains all lead generation campaign results in an organized structure.

## 📁 Folder Structure

```
results/
├── MASTER_LEADS.csv           # All leads from all campaigns (master file)
├── MASTER_LEADS.json          # Complete data in JSON format
├── CAMPAIGNS_SUMMARY.csv      # Overview of all campaigns
├── README.md                  # This file
└── campaigns/                 # Individual campaign folders
    ├── campaign_2025-11-24T10-55-46/
    │   ├── campaign_data.json
    │   ├── campaign_leads.csv
    │   ├── campaign_data_with_emails.json
    │   ├── campaign_leads_with_emails.csv
    │   └── README.md
    └── campaign_2025-11-24T12-14-47/
        ├── campaign_data.json
        ├── campaign_leads.csv
        └── README.md
```

## 📄 Master Files (Always Use These)

### MASTER_LEADS.csv
**The single source of truth for all your leads across all campaigns.**

**Columns:**
- Campaign Date - When the campaign was run
- Campaign Name - Name of the campaign
- Campaign Folder - Reference to the original campaign folder
- Business Name - Company name
- Phone - Contact phone number (100% coverage)
- Email - Email address (if available)
- Address - Full business address
- Website - Company website URL
- Category - Business category/industry
- Rating - Google Maps rating
- Reviews - Number of reviews
- Priority - URGENT/HIGH/MEDIUM/LOW
- Score - Quality score (0-100)
- Latitude, Longitude - GPS coordinates

**Usage:**
```bash
# Import all leads to Odoo CRM
python odoo-integration/bulk_import_leads.py results/MASTER_LEADS.csv

# Open in Excel/Google Sheets for analysis
# Sort by Priority column to focus on HIGH priority leads
# Filter by Campaign Name to view specific campaign results
```

### MASTER_LEADS.json
Complete data structure with all campaign metadata and lead details. Use this for:
- Programmatic access to campaign data
- Custom analysis scripts
- Data migration or backup

### CAMPAIGNS_SUMMARY.csv
Quick overview of all campaigns with statistics:
- Campaign dates and names
- Total businesses scraped vs qualified leads
- Email and phone coverage
- Priority distribution
- Duration and Apify Run IDs

**Usage:** Open to see performance across all campaigns at a glance.

## 📁 Individual Campaign Folders

Each campaign run is stored in a separate folder: `campaign_YYYY-MM-DDTHH-MM-SS/`

### Files in Each Campaign Folder:

1. **campaign_data.json** - Raw data from Apify including all 400+ businesses scraped
2. **campaign_leads.csv** - Only qualified leads (phone number required)
3. **campaign_data_with_emails.json** - Data after email extraction attempt (if run)
4. **campaign_leads_with_emails.csv** - CSV with email column populated (if available)
5. **README.md** - Campaign-specific details and statistics

### When to Use Individual Campaign Folders:
- Review a specific campaign's performance
- Re-import a particular campaign's data
- Troubleshoot or audit a specific run
- Compare results between different campaign configurations

## 🔄 Automatic Organization

Every time you run a campaign, the results are automatically saved. To organize them:

```bash
node scripts/utilities/organize-results.js
```

This script will:
1. ✅ Move each campaign to a separate dated folder
2. ✅ Update MASTER_LEADS.csv with all leads
3. ✅ Update MASTER_LEADS.json with complete data
4. ✅ Update CAMPAIGNS_SUMMARY.csv with overview
5. ✅ Create README.md in each campaign folder

**Run this after every campaign to keep results organized!**

## 📊 Workflow Recommendations

### Daily Use:
1. **Import to CRM**: Use `MASTER_LEADS.csv` for CRM imports
2. **Focus on HIGH Priority**: Sort by Priority column, call HIGH priority leads first
3. **Track Progress**: Mark contacted leads in CRM to avoid duplicates

### Weekly Review:
1. Open `CAMPAIGNS_SUMMARY.csv` to see overall performance
2. Compare qualification rates across campaigns
3. Identify best-performing locations/industries

### Campaign Analysis:
1. Go to specific campaign folder
2. Read `README.md` for campaign details
3. Review `campaign_data.json` for detailed business info
4. Use coordinates for mapping leads geographically

## 🎯 Lead Quality Scoring

Leads are scored 0-100 based on:
- **+30 points**: Has phone number (mandatory)
- **+10 points**: Has business name
- **+10 points**: Has address
- **+20 points**: Has email address
- **+15 points**: Has website
- **+10 points**: Rating ≥ 4.0
- **+10 points**: Reviews ≥ 10
- **+15 points**: Target location (Deira, Business Bay, etc.)
- **+10 points**: Target industry

### Priority Levels:
- **URGENT**: Score ≥ 80 (best leads)
- **HIGH**: Score 65-79 (very good leads)
- **MEDIUM**: Score 50-64 (good leads)
- **LOW**: Score 40-49 (acceptable leads)

## 📧 Email Availability

**Important**: Google Maps does NOT publicly display email addresses.

**Current Status**: ~0% of leads have emails from scraping

**Solutions**:
1. **Phone-first approach** (FREE) - Call and ask for email
2. **Hunter.io** ($49/month) - Automated email lookup by domain
3. **Apollo.io** ($49-99/month) - B2B database with decision-maker emails
4. **Manual research** (FREE) - Visit websites for HIGH priority leads

See `EMAIL-EXTRACTION-GUIDE.md` in the root folder for complete details.

## 🔒 Data Integrity

- **No Duplicates Within Campaign**: Each lead appears once per campaign
- **Possible Cross-Campaign Duplicates**: Same business may appear in multiple campaigns if targeted by different queries
- **Phone Number Verified**: All leads have phone numbers (mandatory filter)
- **Original Data Preserved**: Raw data always kept in `campaign_data.json`

## 📱 Import to Odoo CRM

### Import Master File (Recommended):
```bash
python odoo-integration/bulk_import_leads.py results/MASTER_LEADS.csv
```

### Import Specific Campaign:
```bash
python odoo-integration/bulk_import_leads.py results/campaigns/campaign_YYYY-MM-DDTHH-MM-SS/campaign_leads.csv
```

The import script will:
- Map CSV columns to Odoo CRM fields
- Set lead priority based on score
- Add source tags (campaign name)
- Prevent duplicate imports (by phone number)
- Create activities for HIGH priority leads

## 🔍 Data Analysis Tips

### Excel/Google Sheets:
1. Open `MASTER_LEADS.csv`
2. Enable filters on header row
3. Sort by Priority column (HIGH first)
4. Filter by Campaign Name to isolate specific runs
5. Use COUNTIF to analyze by category/location

### Python/Pandas:
```python
import pandas as pd

# Load master data
df = pd.read_csv('results/MASTER_LEADS.csv')

# High priority leads only
high_priority = df[df['Priority'] == 'HIGH']

# Count by category
by_category = df.groupby('Category').size()

# Average score by campaign
by_campaign = df.groupby('Campaign Name')['Score'].mean()
```

## 📞 Contact Strategy

### Week 1: HIGH Priority (32 leads from latest campaign)
- Call during business hours (9 AM - 6 PM GST)
- Ask for decision-maker (Operations Manager, Owner)
- Request email for follow-up materials
- Log call outcomes in CRM

### Week 2: MEDIUM Priority (280 leads from latest campaign)
- Batch calling in 50-lead chunks
- Quick qualification script
- Email collection as secondary goal
- Focus on appointment setting

### Week 3: Cross-Campaign Analysis
- Review conversion rates by priority
- Identify best-performing categories
- Refine targeting for next campaign

## ⚙️ Maintenance

### Keep Results Clean:
```bash
# After each new campaign run:
node scripts/utilities/organize-results.js
```

### Backup Master Files:
```bash
# Copy master files to backup location
cp results/MASTER_LEADS.* backup/leads_backup_$(date +%Y%m%d)/
```

### Archive Old Campaigns:
```bash
# Move campaigns older than 3 months to archive
# (Manual process - review before deleting)
```

## 📚 Related Documentation

- `EMAIL-EXTRACTION-GUIDE.md` - How to get email addresses
- `HR-CAMPAIGN-QUICK-START.md` - Campaign setup guide
- `docs/guides/APIFY-HR-CAMPAIGN-GUIDE.md` - Complete Apify guide
- `.github/copilot-instructions.md` - Project architecture

## 🆘 Troubleshooting

**Q: Why are there 0 emails?**
A: Google Maps doesn't show emails publicly. Use phone-first approach or email enrichment services.

**Q: How to avoid duplicate imports to CRM?**
A: The import script checks phone numbers. Leads with existing phone numbers are skipped.

**Q: Can I delete old campaign folders?**
A: Yes, but keep MASTER_LEADS.csv updated. Campaign folders are for reference/audit only.

**Q: How to run a new campaign?**
A: See `HR-CAMPAIGN-QUICK-START.md` for step-by-step instructions.

---

**Last Updated**: 2025-11-24  
**Total Campaigns**: 2  
**Total Leads**: 917
