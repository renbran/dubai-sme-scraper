# Apollo.io C-Level Executive Scraper

Find and extract **C-suite executives and decision makers** from companies using Apollo.io's professional contact database.

## 🎯 What It Does

- **Finds C-Level Contacts**: CEO, CFO, CTO, COO, CMO, etc.
- **Targets Decision Makers**: VPs, Directors, Founders, Managing Partners
- **Direct Contact Info**: Emails, phone numbers, LinkedIn profiles
- **Company Intelligence**: Industry, size, revenue, tech stack
- **Combined Scraping**: Integrates with Google Maps for comprehensive leads

## 🚀 Quick Start

### 1. Get Apollo API Key

1. Sign up at [Apollo.io](https://www.apollo.io/)
2. Go to Settings → API → Create API Key
3. Copy your key

### 2. Set Environment Variable

```powershell
$env:APOLLO_API_KEY="your_apollo_api_key_here"
```

### 3. Run Test

```bash
npm run apollo:test
```

This finds ~10 C-level executives in Dubai tech companies.

### 4. Run Combined Campaign

```bash
npm run apollo:campaign
```

This scrapes Google Maps + enriches with Apollo executives for comprehensive lead generation.

## 📋 Usage Options

### Option A: PowerShell Launcher (Interactive)

```powershell
.\launch-apollo-scraper.ps1
```

Interactive menu with:
1. Quick test (5-10 executives)
2. Combined campaign (Google Maps + Apollo)
3. Custom company search

### Option B: NPM Scripts

```bash
# Quick test
npm run apollo:test

# Full campaign
npm run apollo:campaign
```

### Option C: Direct Node Commands

```bash
# Test Apollo scraper
node scripts/tests/apollo-executive-test.js

# Combined Google Maps + Apollo
node scripts/campaigns/apollo-combined-campaign.js
```

## 📊 Output Format

Results saved to `results/` directory:

**JSON Example:**
```json
{
  "name": "Tech Company DMCC",
  "address": "Dubai Internet City",
  "website": "https://techcompany.com",
  "executiveCount": 3,
  "executives": [
    {
      "fullName": "Ahmed Al Mansouri",
      "title": "Chief Executive Officer",
      "email": "ahmed@techcompany.com",
      "phone": "+971501234567",
      "linkedinUrl": "https://linkedin.com/in/ahmedalmansouri",
      "seniority": "c_suite"
    },
    {
      "fullName": "Sarah Johnson",
      "title": "Chief Technology Officer",
      "email": "sarah@techcompany.com",
      "phone": "+971507654321",
      "linkedinUrl": "https://linkedin.com/in/sarahjohnson",
      "seniority": "c_suite"
    }
  ],
  "primaryContact": {
    "name": "Ahmed Al Mansouri",
    "title": "Chief Executive Officer",
    "email": "ahmed@techcompany.com"
  },
  "aiAnalysis": {
    "leadScore": 85,
    "priority": "high",
    "erpReadiness": "high"
  }
}
```

## 🎭 Seniority Levels Supported

- `founder` - Founders, Co-Founders
- `c_suite` - CEO, CFO, CTO, COO, etc.
- `vp` - Vice Presidents (VP, SVP, EVP)
- `director` - Directors, Managing Directors
- `owner` - Business Owners
- `partner` - Partners, Managing Partners

## 💡 Examples

### Find Executives at Specific Company

```javascript
const ApolloScraper = require('./src/data-sources/apollo-scraper');

const scraper = new ApolloScraper({
    apiKey: process.env.APOLLO_API_KEY
});

await scraper.initialize();

const result = await scraper.searchPeople({
    companyName: 'Careem',
    location: ['Dubai', 'United Arab Emirates'],
    seniorityLevels: ['founder', 'c_suite', 'vp'],
    perPage: 10
});

console.log(`Found ${result.contacts.length} executives`);
```

### Search by Title

```javascript
const result = await scraper.searchPeople({
    location: ['Dubai'],
    titles: ['CEO', 'Chief Executive Officer', 'Founder'],
    seniorityLevels: ['founder', 'c_suite'],
    perPage: 25
});
```

### Enrich Existing Leads

```javascript
// You have company names from Google Maps
const companies = ['Tech Co', 'Trading LLC', 'Consulting Group'];

for (const company of companies) {
    const executives = await scraper.searchPeople({
        companyName: company,
        location: ['Dubai'],
        seniorityLevels: ['c_suite', 'vp', 'director'],
        perPage: 5
    });
    
    console.log(`${company}: ${executives.contacts.length} executives found`);
}
```

## 💰 Apollo Credits & Pricing

| Plan | Credits/Month | Cost |
|------|---------------|------|
| Free | 50 | $0 |
| Basic | 1,200 | ~$49/mo |
| Professional | 12,000 | ~$99/mo |
| Organization | Unlimited | Custom |

**Note:** Each contact revealed = 1 credit

## ⚙️ Configuration

### Rate Limiting

```javascript
const scraper = new ApolloScraper({
    apiKey: process.env.APOLLO_API_KEY,
    rateLimit: 60 // Requests per minute (adjust for your plan)
});
```

Free plan: Set to `10`  
Basic/Professional: Set to `30-60`  
Organization: Set to `120`

## 🔍 What Gets Scraped

### Per Contact:
- ✅ Full name (first + last)
- ✅ Job title
- ✅ Seniority level
- ✅ Direct email
- ✅ Phone number
- ✅ LinkedIn URL
- ✅ Company name
- ✅ Company domain
- ✅ Location (city, country)

### Per Company:
- ✅ Company name
- ✅ Domain/website
- ✅ Industry
- ✅ Employee count
- ✅ Revenue range
- ✅ Founded year
- ✅ Technologies used
- ✅ Address
- ✅ Social media links

## 🎯 Use Cases

1. **B2B Lead Generation**: Find decision makers at target companies
2. **ERP Sales**: Identify CEOs/CFOs at SMEs needing business systems
3. **Tech Sales**: Find CTOs/CIOs for software/AI solutions
4. **Recruitment**: Locate HR directors and hiring managers
5. **Partnership Outreach**: Connect with founders and partners

## 📚 Documentation

- **Full Guide**: `docs/guides/APOLLO-INTEGRATION-GUIDE.md`
- **API Reference**: Code comments in `src/data-sources/apollo-scraper.js`
- **Apollo Docs**: https://apolloio.github.io/apollo-api-docs/

## ⚠️ Troubleshooting

**"API key is required"**
```powershell
$env:APOLLO_API_KEY="your_key_here"
```

**"Rate limit exceeded"**
- Lower `rateLimit` in scraper options
- Upgrade Apollo plan

**"No results found"**
- Company may not be in Apollo database
- Try using company domain instead of name
- Expand seniority levels

## 🔗 Integration with CRM

Results automatically include `primaryContact` field for easy CRM import:

```json
{
  "primaryContact": {
    "name": "John Doe",
    "title": "CEO",
    "email": "john@company.com",
    "phone": "+971501234567",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  }
}
```

Perfect for pushing to:
- Odoo CRM (via webhook)
- Salesforce
- HubSpot
- Pipedrive
- Any CRM with API

## 🚀 Next Steps

1. ✅ Set `APOLLO_API_KEY` environment variable
2. ✅ Run quick test: `npm run apollo:test`
3. ✅ Check `results/` directory for output
4. ✅ Run combined campaign: `npm run apollo:campaign`
5. ✅ Integrate with your sales workflow

---

**Ready to find your next clients' decision makers?** 🎯

Questions? Check `docs/guides/APOLLO-INTEGRATION-GUIDE.md` for detailed documentation.
