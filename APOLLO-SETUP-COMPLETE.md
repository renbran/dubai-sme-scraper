# ✅ Apollo.io Integration Complete

## What Was Created

### 1. Core Apollo Scraper
**File**: `src/data-sources/apollo-scraper.js`

- Full-featured Apollo.io API integration
- Search for C-level executives and decision makers
- Company enrichment and intelligence
- Automatic rate limiting and retry logic
- Credit usage tracking

**Key Features**:
- ✅ C-Suite targeting (CEO, CFO, CTO, etc.)
- ✅ Decision maker seniority levels (Founder, VP, Director)
- ✅ Direct contact extraction (email, phone, LinkedIn)
- ✅ Company data enrichment
- ✅ Smart rate limiting
- ✅ Credit monitoring

### 2. Test Script
**File**: `scripts/tests/apollo-executive-test.js`

Quick test script that demonstrates:
- Finding tech executives in Dubai
- Searching executives at specific companies
- Getting companies with their executive teams

**Run**: `npm run apollo:test`

### 3. Combined Campaign
**File**: `scripts/campaigns/apollo-combined-campaign.js`

Production-ready campaign combining:
1. **Google Maps scraping** → Find companies
2. **Apollo enrichment** → Add C-level contacts
3. **AI analysis** → Score and prioritize leads
4. **Export** → Save with executive contact details

**Run**: `npm run apollo:campaign`

### 4. Documentation
**Files**:
- `README_APOLLO.md` - Quick start guide
- `docs/guides/APOLLO-INTEGRATION-GUIDE.md` - Complete documentation

Covers:
- Setup instructions
- API reference
- Examples
- Troubleshooting
- Best practices

### 5. Configuration
**File**: `config/apollo_config.json`

Pre-configured settings for:
- Apollo API options
- Search parameters
- Integration settings
- Output preferences

### 6. PowerShell Launcher
**File**: `launch-apollo-scraper.ps1`

Interactive launcher with menu:
1. Quick test
2. Combined campaign
3. Custom company search

**Run**: `.\launch-apollo-scraper.ps1`

### 7. NPM Scripts
Added to `package.json`:
```json
"apollo:test": "node scripts/tests/apollo-executive-test.js",
"apollo:campaign": "node scripts/campaigns/apollo-combined-campaign.js"
```

---

## 🚀 How to Use

### Step 1: Get Apollo API Key

1. Sign up at https://www.apollo.io/
2. Go to Settings → API → Create API Key
3. Copy your key

### Step 2: Set Environment Variable

```powershell
$env:APOLLO_API_KEY="your_apollo_api_key_here"
```

**Make it permanent** (optional):
```powershell
[System.Environment]::SetEnvironmentVariable('APOLLO_API_KEY', 'your_key', 'User')
```

### Step 3: Run Test

```bash
npm run apollo:test
```

This will:
- Search for ~10 tech executives in Dubai
- Find executives at example companies
- Display contact details (name, title, email, phone)
- Save results to `results/` directory

### Step 4: Run Combined Campaign

```bash
npm run apollo:campaign
```

This will:
1. Scrape 150+ companies from Google Maps
2. For each company, find C-level executives on Apollo
3. Enrich with AI business intelligence
4. Save comprehensive lead data with executive contacts

**Output includes**:
- Company details (name, address, website, phone)
- Executive contacts (name, title, email, phone, LinkedIn)
- Primary decision maker
- AI lead scoring
- ERP readiness assessment

---

## 📊 What You Get

### Sample Output (JSON):

```json
{
  "name": "TechCorp DMCC",
  "address": "Dubai Internet City",
  "website": "https://techcorp.ae",
  "phone": "+971 4 123 4567",
  "rating": 4.5,
  "reviewCount": 42,
  
  "executiveCount": 3,
  "hasExecutiveContacts": true,
  
  "executives": [
    {
      "fullName": "Ahmed Al Mansouri",
      "title": "Chief Executive Officer",
      "email": "ahmed@techcorp.ae",
      "phone": "+971501234567",
      "linkedinUrl": "https://linkedin.com/in/ahmedalmansouri",
      "seniority": "c_suite"
    },
    {
      "fullName": "Sarah Johnson",
      "title": "Chief Technology Officer",
      "email": "sarah@techcorp.ae",
      "phone": "+971507654321",
      "linkedinUrl": "https://linkedin.com/in/sarahjohnson",
      "seniority": "c_suite"
    },
    {
      "fullName": "Mohammed Hassan",
      "title": "VP of Operations",
      "email": "mohammed@techcorp.ae",
      "phone": "+971505555555",
      "linkedinUrl": "https://linkedin.com/in/mohammedhassan",
      "seniority": "vp"
    }
  ],
  
  "primaryContact": {
    "name": "Ahmed Al Mansouri",
    "title": "Chief Executive Officer",
    "email": "ahmed@techcorp.ae",
    "phone": "+971501234567",
    "linkedinUrl": "https://linkedin.com/in/ahmedalmansouri"
  },
  
  "aiAnalysis": {
    "leadScore": 85,
    "priority": "high",
    "erpReadiness": "high",
    "businessSize": "medium",
    "digitalMaturity": "advanced",
    "painPoints": [
      "Manual processes",
      "Scaling challenges",
      "Integration needs"
    ]
  }
}
```

---

## 🎯 Executive Seniority Levels

The scraper targets these decision-maker levels:

| Level | Who | Example Titles |
|-------|-----|----------------|
| **founder** | Company founders | Founder, Co-Founder |
| **c_suite** | C-level executives | CEO, CFO, CTO, COO, CMO, CIO |
| **owner** | Business owners | Owner, Co-Owner |
| **partner** | Partners | Partner, Managing Partner |
| **vp** | Vice Presidents | VP, SVP, EVP |
| **director** | Directors | Director, Managing Director, GM |

All searches include **direct contact information**:
- ✅ Work email addresses
- ✅ Phone numbers
- ✅ LinkedIn profile URLs

---

## 💡 Use Cases

### 1. B2B Lead Generation
Find decision makers at target companies for outreach campaigns.

### 2. ERP Sales
Identify CFOs and COOs at growing SMEs who need business automation.

### 3. Tech Sales
Locate CTOs and CIOs for software/AI solution pitches.

### 4. Recruitment
Find HR directors and hiring managers at expanding companies.

### 5. Partnership Development
Connect with founders and partners for strategic collaborations.

---

## 📈 Apollo API Usage

### Credit Consumption
- Each contact revealed = **1 credit**
- Company search = **free** (no credits)
- Person search revealing contacts = **1 credit per contact**

### Rate Limits
| Plan | Credits/Month | API Calls/Min |
|------|---------------|---------------|
| Free | 50 | 10 |
| Basic | 1,200 | 30 |
| Professional | 12,000 | 60 |
| Organization | Unlimited | 120 |

**Scraper auto-adjusts** to your rate limit - just configure:
```javascript
rateLimit: 60 // requests per minute
```

---

## 🔧 Advanced Usage

### Find Executives at Specific Company

```javascript
const ApolloScraper = require('./src/data-sources/apollo-scraper');

const scraper = new ApolloScraper({
    apiKey: process.env.APOLLO_API_KEY
});

await scraper.initialize();

const result = await scraper.searchPeople({
    companyName: 'Careem',
    location: ['Dubai'],
    seniorityLevels: ['founder', 'c_suite', 'vp'],
    perPage: 10
});

console.log(`Found ${result.contacts.length} executives`);
```

### Search by Title Only

```javascript
const result = await scraper.searchPeople({
    location: ['United Arab Emirates'],
    titles: ['CEO', 'Chief Executive Officer'],
    seniorityLevels: ['c_suite'],
    perPage: 50
});
```

### Enrich Existing Leads

```javascript
const existingLeads = [...]; // From Google Maps

for (const lead of existingLeads) {
    const executives = await scraper.searchPeople({
        companyName: lead.name,
        companyDomain: extractDomain(lead.website),
        location: ['Dubai'],
        perPage: 5
    });
    
    lead.executives = executives.contacts;
    lead.hasDecisionMaker = executives.contacts.length > 0;
}
```

---

## 🔗 Integration Points

### 1. Google Maps Scraper
✅ **Already integrated** in `apollo-combined-campaign.js`

Workflow:
1. Scrape companies from Google Maps
2. For each company → find executives on Apollo
3. Combine data into enriched leads

### 2. AI Intelligence
✅ **Already integrated** in combined campaign

Adds:
- Lead scoring (0-100)
- Priority level (high/medium/low)
- ERP readiness assessment
- Pain point analysis

### 3. CRM Integration (Odoo)
✅ **Ready to integrate**

Output includes `primaryContact` field for direct CRM push:
```json
{
  "primaryContact": {
    "name": "Ahmed Al Mansouri",
    "title": "CEO",
    "email": "ahmed@company.com"
  }
}
```

Just map to your Odoo fields in webhook handler.

### 4. Multi-Source Aggregator
🔧 **Can be added**

Extend `src/data-sources/multi-source-aggregator.js` to include Apollo as a data source.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README_APOLLO.md` | Quick start guide |
| `docs/guides/APOLLO-INTEGRATION-GUIDE.md` | Complete API reference & examples |
| `src/data-sources/apollo-scraper.js` | Code documentation (inline comments) |

---

## ⚠️ Common Issues & Solutions

### Issue: "API key is required"
**Solution**:
```powershell
$env:APOLLO_API_KEY="your_key_here"
```

### Issue: "Rate limit exceeded"
**Solutions**:
1. Lower `rateLimit` in scraper options
2. Upgrade Apollo plan
3. Add delays between searches

### Issue: "No results found"
**Possible causes**:
- Company not in Apollo database
- Incorrect company name/domain
- Too restrictive seniority filters

**Solutions**:
- Use company domain instead of name
- Expand seniority levels
- Try broader search criteria

### Issue: "Credits exhausted"
**Solutions**:
1. Wait for monthly credit reset
2. Upgrade Apollo plan
3. Optimize searches (fewer contacts per company)

---

## 🎉 Next Steps

### Immediate Actions
1. ✅ Set `APOLLO_API_KEY` environment variable
2. ✅ Run test: `npm run apollo:test`
3. ✅ Review results in `results/` directory
4. ✅ Adjust configuration in `config/apollo_config.json`

### Production Deployment
1. ✅ Run combined campaign: `npm run apollo:campaign`
2. ✅ Integrate with Odoo webhook (add executive fields)
3. ✅ Schedule regular runs (daily/weekly)
4. ✅ Monitor Apollo credit usage

### Customization
1. ✅ Add specific industries/sectors to target
2. ✅ Customize executive title lists
3. ✅ Adjust seniority levels for your market
4. ✅ Create custom search filters

---

## 📞 Support

- **Apollo API Docs**: https://apolloio.github.io/apollo-api-docs/
- **Local Docs**: `docs/guides/APOLLO-INTEGRATION-GUIDE.md`
- **Code Examples**: `scripts/tests/apollo-executive-test.js`

---

## 🚀 Ready to Go!

You now have a complete Apollo.io integration for finding C-level executives and decision makers in Dubai/UAE.

**Start scraping**:
```bash
npm run apollo:test
```

**Questions?** Check the documentation in `docs/guides/APOLLO-INTEGRATION-GUIDE.md`.

Happy lead hunting! 🎯
