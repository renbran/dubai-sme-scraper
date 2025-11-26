# Hunter.io + Snov.io Dual Enrichment Guide

## 🎯 What This Does

Takes your existing **270+ Dubai real estate companies** from Google Maps and enriches them with:
- ✅ Executive names & titles
- ✅ Direct email addresses
- ✅ LinkedIn profiles
- ✅ Phone numbers (when available)
- ✅ Verified contact data

**Total Free Credits: 75 companies!**
- Hunter.io: 25 searches
- Snov.io: 50 credits

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Hunter.io API Key (FREE)

1. Go to https://hunter.io/users/sign_up
2. Create free account
3. Go to https://hunter.io/api_keys
4. Copy your API key

**Free Plan Includes:**
- 25 email searches/month
- 50 email verifications/month
- Email pattern detection
- Confidence scores

---

### Step 2: Get Snov.io Credentials (FREE)

1. Go to https://snov.io/sign-up
2. Create free account
3. Go to https://app.snov.io/api-setting
4. Copy your **Client ID** and **Client Secret**

**Free Plan Includes:**
- 50 credits/month
- Email finder
- Email verification
- LinkedIn enrichment
- Bulk operations

---

### Step 3: Add Credentials to .env File

Open `.env` file in project root and add:

```bash
# Hunter.io
HUNTER_API_KEY=your_hunter_api_key_here

# Snov.io
SNOV_CLIENT_ID=your_snov_client_id_here
SNOV_CLIENT_SECRET=your_snov_client_secret_here
```

**Example:**
```bash
HUNTER_API_KEY=abc123def456ghi789jkl012mno345
SNOV_CLIENT_ID=12345
SNOV_CLIENT_SECRET=xyz789uvw456rst123
```

---

### Step 4: Run the Enrichment Campaign

```bash
npm run enrich
```

**What happens:**
1. Loads your existing Google Maps company data
2. Filters companies with websites (270 → ~180)
3. **Phase 1**: Hunter.io finds executives at first 25 companies
4. **Phase 2**: Snov.io finds contacts at next 50 companies
5. Saves enriched data to CSV + JSON

**Time: 30-45 minutes** (with rate limiting delays)

---

## 📊 What You Get

### Output Files

**1. JSON File:** `dual-enriched-leads-[timestamp].json`
```json
{
  "metadata": {
    "totalBusinesses": 270,
    "enriched": {
      "hunter": 25,
      "snov": 50,
      "total": 75
    },
    "executivesFound": 150
  },
  "businesses": [...],
  "executives": [...]
}
```

**2. CSV File:** `dual-enriched-executives-[timestamp].csv`
```
Name,Email,Position,Company,LinkedIn,Source
Ahmed Al Mansouri,ahmed.almansouri@emaar.com,Property Director,Emaar Properties,https://linkedin.com/in/ahmed-almansouri,Hunter.io
Sarah Thompson,s.thompson@damacproperties.com,Operations Manager,DAMAC Properties,https://linkedin.com/in/sarahthompson,Snov.io
```

---

## 💡 Sample Results

### Before Enrichment (Google Maps):
```
Company: Emaar Properties
Phone: +971 4 362 4444
Website: emaar.com
Address: Business Bay, Dubai
```

### After Hunter.io Enrichment:
```
Company: Emaar Properties
Phone: +971 4 362 4444
Website: emaar.com
Address: Business Bay, Dubai

✨ Executives Found (3):
1. Ahmed Al Mansouri
   Email: ahmed.almansouri@emaar.com
   Position: Property Director
   LinkedIn: linkedin.com/in/ahmed-almansouri
   Confidence: 95%

2. Sarah Johnson
   Email: sarah.johnson@emaar.com
   Position: Operations Manager
   LinkedIn: linkedin.com/in/sarahjohnson-emaar
   Confidence: 92%

3. Mohammed Khalid
   Email: m.khalid@emaar.com
   Position: Facilities Head
   Confidence: 88%
```

---

## 🎯 Expected Results

| Metric | Expected Value |
|--------|----------------|
| Companies Processed | 270 |
| Companies with Websites | ~180 |
| Hunter.io Enriched | 25 |
| Snov.io Enriched | 50 |
| **Total Enriched** | **75** |
| Executives per Company | 2-3 |
| **Total Executives** | **150-200** |
| With Email | 100% |
| With LinkedIn | 60-80% |
| With Phone | 20-40% |

---

## ⚙️ Configuration Options

Edit `scripts/campaigns/dual-enrichment-campaign.js`:

```javascript
const CONFIG = {
    // Input file
    inputFile: 'results/your-google-maps-data.json',
    
    // API keys (loaded from .env)
    hunterApiKey: process.env.HUNTER_API_KEY,
    snovClientId: process.env.SNOV_CLIENT_ID,
    snovClientSecret: process.env.SNOV_CLIENT_SECRET,
    
    // Limits
    hunterLimit: 25,  // Max 25 for free plan
    snovLimit: 50,    // Max 50 for free plan
    
    // Filters
    filterByWebsite: true,        // Only enrich companies with websites
    prioritizeHighQuality: true   // Process high-quality leads first
};
```

---

## 🔧 Troubleshooting

### "Hunter.io API key not found"
- Check `.env` file has `HUNTER_API_KEY=...`
- API key starts with a letter (not 0-9)
- No spaces or quotes around the key

### "Snov.io authentication failed"
- Check both `SNOV_CLIENT_ID` and `SNOV_CLIENT_SECRET`
- Client ID is numeric
- Client Secret is alphanumeric
- No spaces or quotes

### "No executives found"
- Some companies may not have public email addresses
- Expected success rate: 60-70%
- Try upgrading to paid plans for better results

### "Rate limit exceeded"
- Free plans have monthly limits (reset monthly)
- Hunter.io: 25 searches/month
- Snov.io: 50 credits/month
- Wait until next month or upgrade

---

## 💰 Upgrade Options (Optional)

### Hunter.io Plans
- **Free**: 25 searches + 50 verifications/month
- **Starter ($49/mo)**: 500 searches + 1000 verifications
- **Growth ($99/mo)**: 2500 searches + 5000 verifications

### Snov.io Plans
- **Free**: 50 credits/month
- **Trial ($39/mo)**: 1000 credits
- **Small ($99/mo)**: 5000 credits

**Recommendation:** Start with free plans, upgrade only if you need more volume.

---

## 🎉 Ready to Enrich!

Add the npm script to `package.json`:

```json
{
  "scripts": {
    "enrich": "node scripts/campaigns/dual-enrichment-campaign.js"
  }
}
```

Then run:

```bash
npm run enrich
```

---

## 📈 Next Steps After Enrichment

### 1. Verify Emails (Hunter.io)
You have 50 free verifications:
```bash
# Use Hunter.io dashboard or API
# Verify top 50 executives
```

### 2. Enrich Phone Numbers
Use these tools with your enriched data:
- **RocketReach**: 5 free lookups/month
- **Lusha Chrome Extension**: 5 free credits
- **Snov.io**: Already includes some phone numbers

### 3. Import to CRM
Your CSV is ready for:
- Odoo CRM
- Salesforce
- HubSpot
- Pipedrive
- Any CRM with CSV import

### 4. Start Outreach
**Email Template:**
```
Subject: Property Management Solutions for [Company]

Hi [First Name],

I noticed you're leading operations at [Company] in Dubai.

We help property management companies automate:
✓ Tenant management
✓ Maintenance tracking
✓ Financial reporting

Would you be open to a quick 15-minute call next week?

Best regards,
[Your Name]
```

---

## 🆓 Total Free Value

| Service | Free Tier | Value |
|---------|-----------|-------|
| Hunter.io | 25 searches + 50 verifications | $49/mo equivalent |
| Snov.io | 50 credits | $39/mo equivalent |
| **Total** | **75 enriched companies** | **$88/mo value FREE!** |

Plus you already have 270 companies from Google Maps (also free)!

---

## ❓ Questions?

Run the campaign and check the output:
- `results/dual-enriched-executives-[timestamp].csv`

All executive contact information will be ready for your B2B outreach!
