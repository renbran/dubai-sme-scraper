# 🚀 Hunter.io + Snov.io - Quick Start

## What You Need (5 minutes to setup)

### 1. Hunter.io API Key
- Sign up: https://hunter.io/users/sign_up (FREE)
- Get key: https://hunter.io/api_keys
- **Free**: 25 searches + 50 verifications/month

### 2. Snov.io Credentials  
- Sign up: https://snov.io/sign-up (FREE)
- Get credentials: https://app.snov.io/api-setting
- **Free**: 50 credits/month

---

## Setup (Copy-Paste)

Open `.env` file and replace these lines:

```bash
# Hunter.io
HUNTER_API_KEY=paste_your_hunter_key_here

# Snov.io
SNOV_CLIENT_ID=paste_your_client_id_here
SNOV_CLIENT_SECRET=paste_your_client_secret_here
```

---

## Test Your Setup

```bash
npm run enrich:test
```

**This will:**
- ✅ Test Hunter.io connection
- ✅ Test Snov.io connection  
- ✅ Show how many credits you have
- ✅ Run sample searches

**Expected output:**
```
✅ Hunter.io connected successfully!
   Searches available: 25/25
   Verifications available: 50/50

✅ Snov.io connected successfully!
   Credits available: 50/50
```

---

## Run Full Campaign

```bash
npm run enrich
```

**What happens:**
1. Loads your 270 Dubai companies
2. **Hunter.io** enriches first 25 companies (finds executives)
3. **Snov.io** enriches next 50 companies (finds contacts)
4. Saves to CSV + JSON

**Time:** 30-45 minutes

**Output files:**
- `results/dual-enriched-executives-[timestamp].csv`
- `results/dual-enriched-leads-[timestamp].json`

---

## What You Get

**Before (Google Maps only):**
```
Emaar Properties
Phone: +971 4 362 4444
Website: emaar.com
```

**After (with Hunter.io + Snov.io):**
```
Emaar Properties
Phone: +971 4 362 4444
Website: emaar.com

✨ Executives Found (3):
1. Ahmed Al Mansouri - ahmed.almansouri@emaar.com
   Position: Property Director
   LinkedIn: linkedin.com/in/ahmed-almansouri

2. Sarah Johnson - sarah.johnson@emaar.com  
   Position: Operations Manager
   LinkedIn: linkedin.com/in/sarahjohnson-emaar

3. Mohammed Khalid - m.khalid@emaar.com
   Position: Facilities Head
```

---

## Expected Results

| Metric | Value |
|--------|-------|
| Total Companies | 270 |
| **Enriched** | **75** |
| Executives Found | **150-200** |
| With Email | 100% |
| With LinkedIn | 60-80% |

**Total Value: $88/month worth of data - FREE!**

---

## Next Steps

1. **Verify Emails**: Use Hunter.io (50 free verifications)
2. **Import to CRM**: CSV ready for Odoo/Salesforce/HubSpot
3. **Start Outreach**: Email templates included in guide

---

## Need Help?

Read full guide: `HUNTER-SNOV-ENRICHMENT-GUIDE.md`

Or just run:
```bash
npm run enrich:test  # Test setup
npm run enrich       # Run full campaign
```

**Questions?** Check the terminal output - it guides you through each step!
