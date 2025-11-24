# Email Extraction Guide for Lead Generation Campaigns

## Current Status

### ✅ Configuration Updated
All campaign scripts have been updated to:
- Extract email addresses from business data
- Add +20 scoring bonus for leads with emails
- Include email field in CSV exports
- Track email statistics (X with email / Y total)
- Display email percentage in campaign summaries

**Updated Files:**
- `apify-inputs/hr-outsourcing-campaign.json` - Email extraction enabled
- `scripts/campaigns/apify-hr-outsourcing.js` - Email field added to all outputs
- `scripts/utilities/extract-emails-from-results.js` - Post-processing script

### ❌ Challenge: Google Maps Email Limitation
**Reality Check:** Google Maps business listings **rarely include email addresses**

**What Google Maps DOES provide:**
- ✅ Business name
- ✅ Phone numbers (primary focus)
- ✅ Physical address
- ✅ Website URL
- ✅ Category, ratings, reviews
- ✅ Opening hours, coordinates

**What Google Maps DOES NOT provide:**
- ❌ Email addresses (99% of listings)
- ❌ Contact person names
- ❌ Direct decision-maker info

### 📊 First Campaign Results
- **File:** `results/apify-hr-outsourcing-1763981746357.csv`
- **Leads:** 500 qualified businesses
- **Phone Numbers:** 500 (100% coverage - mandatory requirement)
- **Emails:** 0 (0% - expected due to Google Maps limitation)
- **Industries:** Construction, Electromechanical, Packaging
- **Locations:** Business Bay, JVC, JLT

---

## Solutions for Getting Email Addresses

### Option 1: Website Scraping (Automated)
**Best for:** High-volume email enrichment

**Tools/Services:**
1. **Hunter.io** (https://hunter.io)
   - Find email addresses by company domain
   - Email verification included
   - Pricing: $49/month for 1,000 searches

2. **Apollo.io** (https://apollo.io)
   - B2B contact database with 250M+ contacts
   - Includes emails, phone, LinkedIn profiles
   - Pricing: $49-99/month

3. **Snov.io** (https://snov.io)
   - Email finder and verifier
   - LinkedIn scraper integration
   - Pricing: $39/month for 1,000 credits

4. **Custom Website Scraper** (DIY)
   - Use Playwright/Puppeteer to visit business websites
   - Extract emails from contact pages
   - Requires development time but free to run

### Option 2: Manual Enrichment (High-Value Leads)
**Best for:** Priority leads (URGENT/HIGH priority)

**Process:**
1. Export top 50-100 HIGH priority leads from CSV
2. Visit each business website manually
3. Navigate to Contact Us / About Us pages
4. Copy email addresses into spreadsheet
5. Verify email format (avoid info@ catch-alls if targeting decision-makers)

**Time Estimate:** 2-3 minutes per lead = 2-5 hours for 100 leads

### Option 3: LinkedIn Research
**Best for:** Finding decision-maker emails

**Process:**
1. Search company name on LinkedIn
2. Find company page
3. View employees in relevant positions (HR Manager, Operations Manager, CEO)
4. Connect or use LinkedIn Sales Navigator to get contact info
5. Use email permutation tools: `firstname.lastname@company.com`

**Tools:**
- LinkedIn Sales Navigator ($79/month)
- Email permutation: Hunter.io, RocketReach

### Option 4: Direct Outreach by Phone First
**Best for:** Building relationship before email

**Strategy:**
1. Use existing phone numbers (100% coverage)
2. Call businesses and ask for email during conversation
3. Qualify interest level on phone
4. Get email for follow-up materials
5. Higher conversion rate than cold email

---

## Recommended Workflow

### Phase 1: Phone-First Outreach ✅ (Ready Now)
**Current Assets:**
- 500 businesses with confirmed phone numbers
- Prioritized by scoring (URGENT/HIGH/MEDIUM)
- Location and industry qualified

**Action Steps:**
1. Import leads to Odoo CRM:
   ```bash
   python odoo-integration/bulk_import_leads.py results/apify-hr-outsourcing-1763981746357.csv
   ```

2. Sales team calls HIGH priority leads (89 leads)
   - Qualify interest in HR outsourcing
   - Ask for email during call for follow-up
   - Schedule meetings for interested prospects

3. Track email collection in CRM
   - Update lead records with obtained emails
   - Export enriched data back to CSV if needed

### Phase 2: Automated Email Enrichment (Optional)
**For leads who don't answer phone or prefer email:**

**Option A - Hunter.io Integration:**
```javascript
// Pseudo-code for batch email lookup
const Hunter = require('hunter');
const hunter = new Hunter('YOUR_API_KEY');

leads.forEach(async lead => {
    if (lead.website) {
        const domain = extractDomain(lead.website);
        const emails = await hunter.domainSearch(domain);
        lead.email = emails[0]; // Get primary email
    }
});
```

**Option B - Apollo.io CSV Upload:**
1. Export CSV with company names and websites
2. Upload to Apollo.io
3. Apollo matches to database and enriches with emails
4. Download enriched CSV
5. Re-import to CRM

### Phase 3: Website Contact Page Scraping (Advanced)
**Custom solution for continuous email extraction:**

Create Playwright script to:
1. Take business website URL
2. Navigate to common contact page patterns:
   - `/contact`, `/contact-us`, `/about`, `/about-us`
3. Extract email addresses using regex
4. Verify email format and domain match
5. Save to database

**Implementation Time:** 1-2 days development + testing

---

## Budget Consideration

### Apify Campaign Status
- **Free Tier Remaining:** $0.001668 (exhausted)
- **Blocker:** Cannot run new Deira area campaign
- **Upgrade Required:** $49/month for 500 hours

### Cost-Benefit Analysis

**Scenario A: Upgrade Apify + Hunter.io**
- Apify: $49/month (unlimited Google Maps scraping)
- Hunter.io: $49/month (1,000 email lookups)
- **Total:** $98/month
- **Output:** 1,000+ qualified leads/month with emails

**Scenario B: Manual + Existing Results**
- Use existing 500 leads (already paid for in free tier)
- Manual phone outreach (no cost)
- Collect emails during calls (no cost)
- **Total:** $0/month
- **Output:** Build email list organically through conversations

**Scenario C: Phone-First, Email Later**
- Focus on phone outreach now (500 leads ready)
- Upgrade Apify only after validating demand ($49/month)
- Add email enrichment later if needed
- **Total:** $0 now, $49-98/month later
- **Output:** Validate ROI before spending

---

## Next Actions

### Immediate (No Budget Required)
1. ✅ **Review existing 500 leads CSV**
   - Open: `results/apify-hr-outsourcing-1763981746357.csv`
   - Prioritize HIGH priority leads (89 leads)

2. ✅ **Import to Odoo CRM**
   ```bash
   python odoo-integration/bulk_import_leads.py results/apify-hr-outsourcing-1763981746357.csv
   ```

3. ✅ **Start phone outreach**
   - Use phone numbers (100% coverage)
   - Ask for email during conversation
   - Qualify interest in services

### Short-Term (After Budget Approval)
1. **Upgrade Apify** - $49/month
   - Run Deira area Phase 1 campaign (500 real estate leads)
   - Continue with Phase 2 areas (Al Barsha, Al Quoz, etc.)

2. **Add Email Enrichment** - $49/month (Hunter.io or Apollo.io)
   - Enrich existing and new leads with emails
   - Automated batch processing

### Long-Term (Custom Development)
1. **Build Website Email Scraper**
   - Playwright/Puppeteer automation
   - Extract emails from contact pages
   - Integrate with campaign pipeline

2. **LinkedIn Integration**
   - Connect to LinkedIn Sales Navigator API
   - Extract decision-maker contacts
   - Match to company leads

---

## Technical Notes

### Email Extraction Script
**Location:** `scripts/utilities/extract-emails-from-results.js`

**Purpose:** Post-process existing campaign results to extract any emails found in:
- Business descriptions
- Website URLs
- Additional info fields
- Review text (rare)

**Usage:**
```bash
node scripts/utilities/extract-emails-from-results.js results/[filename].json
```

**Output:**
- `[filename]-with-emails.json` - Updated JSON with email fields
- `[filename]-with-emails.csv` - Updated CSV with Email column

**Limitation:** Only finds emails if they exist in scraped data (unlikely for Google Maps)

### Future Campaign Configuration
All new campaigns will automatically:
- Attempt email extraction from all available fields
- Assign +20 bonus points to leads with emails
- Include email column in CSV exports
- Display email statistics in campaign summaries
- Track email coverage percentage

**Configuration File:** `apify-inputs/hr-outsourcing-campaign.json`
```json
{
  "outputFormat": {
    "includeEmails": true,
    "scrapeWebsiteForEmails": true
  }
}
```

---

## Conclusion

### Reality Check
✅ **Phone numbers:** Reliable from Google Maps (100% coverage achieved)
❌ **Email addresses:** Not available on Google Maps listings

### Recommended Approach
1. **Use existing 500 leads with phone numbers**
2. **Phone-first outreach strategy**
3. **Collect emails organically during calls**
4. **Upgrade to email enrichment services only if ROI proven**

This approach:
- No additional budget required immediately
- Validates demand through direct conversations
- Builds relationship before email cold outreach
- Higher conversion rates than cold email

### Questions?
- Budget approval for Apify upgrade? → Contact finance
- Email enrichment service selection? → Compare Hunter.io vs Apollo.io
- Custom development for website scraping? → Estimate 1-2 days dev time

**Last Updated:** November 24, 2025
