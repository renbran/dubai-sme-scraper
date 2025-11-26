# Apollo.io Integration Guide

## Overview
This integration allows you to scrape **C-level executives and decision makers** using Apollo.io's professional contact database. Perfect for B2B lead generation targeting CEOs, CFOs, CTOs, VPs, Directors, and other key decision makers.

## Features

✅ **C-Suite Contact Discovery**: Find CEOs, CFOs, CTOs, COOs, CMOs, etc.  
✅ **Decision Maker Targeting**: VPs, Directors, Founders, Partners, Managing Directors  
✅ **Company Enrichment**: Get company details, tech stack, revenue, employee count  
✅ **Email & Phone Extraction**: Direct contact information for executives  
✅ **LinkedIn URLs**: Professional profiles for each contact  
✅ **Combined Campaigns**: Integrate with Google Maps scraping for comprehensive lead data  

---

## Setup

### 1. Get Apollo API Key

1. Sign up at [Apollo.io](https://www.apollo.io/)
2. Go to **Settings** → **API** → **API Keys**
3. Generate a new API key
4. Copy the key

### 2. Configure Environment

Add to your `.env` file or set as environment variable:

```bash
APOLLO_API_KEY=your_apollo_api_key_here
```

**Windows PowerShell:**
```powershell
$env:APOLLO_API_KEY="your_apollo_api_key_here"
```

**Command Prompt:**
```cmd
set APOLLO_API_KEY=your_apollo_api_key_here
```

### 3. Install Dependencies

No additional dependencies needed - uses existing `axios` package.

---

## Usage Examples

### Quick Test (5 executives)

```bash
node scripts/tests/apollo-executive-test.js
```

This will:
- Search for tech executives in Dubai
- Find executives at a specific company (e.g., Careem)
- Get companies with their C-suite contacts

### Combined Campaign (Google Maps + Apollo)

```bash
node scripts/campaigns/apollo-combined-campaign.js
```

This will:
1. Scrape companies from Google Maps
2. For each company, find C-level contacts on Apollo
3. Enrich with AI analysis
4. Save to JSON/CSV with executive contact details

---

## API Reference

### Initialize Scraper

```javascript
const ApolloScraper = require('./src/data-sources/apollo-scraper');

const scraper = new ApolloScraper({
    apiKey: process.env.APOLLO_API_KEY,
    rateLimit: 60, // requests per minute
    timeout: 30000,
    retryAttempts: 3
});

await scraper.initialize();
```

### Search for People (Executives)

```javascript
const result = await scraper.searchPeople({
    companyName: 'Careem',
    companyDomain: 'careem.com',
    location: ['United Arab Emirates', 'Dubai'],
    titles: ['CEO', 'CTO', 'CFO', 'VP'],
    seniorityLevels: ['founder', 'c_suite', 'vp', 'director'],
    page: 1,
    perPage: 25
});

console.log(`Found ${result.contacts.length} executives`);
result.contacts.forEach(contact => {
    console.log(`${contact.fullName} - ${contact.title}`);
    console.log(`Email: ${contact.email}`);
    console.log(`Phone: ${contact.phone}`);
});
```

### Enrich a Person

```javascript
const person = await scraper.enrichPerson({
    email: 'john.doe@example.com'
    // OR
    linkedin_url: 'https://linkedin.com/in/johndoe'
    // OR
    organization_name: 'Company Name',
    person_name: 'John Doe'
});

console.log(person.fullName);
console.log(person.title);
console.log(person.companyName);
```

### Search Companies with Executives

```javascript
const result = await scraper.searchCompaniesWithExecutives({
    location: ['United Arab Emirates'],
    employeeCount: ['11-50', '51-200', '201-500'],
    industries: [], // Add Apollo industry IDs
    perPage: 10,
    maxExecutivesPerCompany: 5
});

result.companies.forEach(company => {
    console.log(`\n${company.name}`);
    console.log(`Executives: ${company.executiveCount}`);
    
    company.executives.forEach(exec => {
        console.log(`  - ${exec.fullName} (${exec.title})`);
    });
});
```

### Get Company Information

```javascript
const company = await scraper.getCompanyInfo({
    domain: 'careem.com'
    // OR
    name: 'Careem'
});

console.log(company.name);
console.log(company.industry);
console.log(company.employeeCount);
console.log(company.revenue);
```

---

## Seniority Levels

Available seniority filters:

| Level | Description |
|-------|-------------|
| `founder` | Founders, Co-Founders |
| `c_suite` | CEO, CFO, CTO, COO, CMO, etc. |
| `owner` | Business Owners |
| `partner` | Partners, Managing Partners |
| `vp` | VP, SVP, EVP |
| `director` | Directors, Managing Directors |
| `manager` | Managers |
| `senior` | Senior level employees |
| `entry` | Entry level |

---

## Executive Title Patterns

Pre-configured title searches:

**C-Suite:**
- CEO, Chief Executive Officer
- CFO, Chief Financial Officer
- CTO, Chief Technology Officer
- CIO, Chief Information Officer
- COO, Chief Operating Officer
- CMO, Chief Marketing Officer
- CHRO, Chief Human Resources Officer
- CPO, Chief Product Officer
- CDO, Chief Digital Officer

**Founders & Owners:**
- Founder, Co-Founder
- Owner, Co-Owner
- Managing Partner, Partner

**VP Level:**
- VP, Vice President
- SVP, Senior Vice President
- EVP, Executive Vice President

**Director Level:**
- Director, Managing Director
- General Manager, GM

**Department Heads:**
- Head of [Department]
- President

---

## Rate Limits & Credits

### Apollo Plans (as of 2024)

| Plan | Credits/Month | API Calls/Min |
|------|---------------|---------------|
| Free | 50 | 10 |
| Basic | 1,200 | 30 |
| Professional | 12,000 | 60 |
| Organization | Unlimited | 120 |

**Note:** Each search consumes 1 credit per contact revealed.

### Rate Limiting

The scraper automatically handles rate limiting:

```javascript
const scraper = new ApolloScraper({
    rateLimit: 60 // Max requests per minute
});
```

Adjust based on your plan to avoid API errors.

---

## Output Format

### Contact Object

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "title": "Chief Technology Officer",
  "seniority": "c_suite",
  "email": "john.doe@company.com",
  "phone": "+971501234567",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "companyName": "Tech Company DMCC",
  "companyDomain": "techcompany.com",
  "companyIndustry": "Information Technology",
  "companySize": "51-200",
  "city": "Dubai",
  "country": "United Arab Emirates",
  "apolloId": "abc123",
  "dataSource": "apollo.io"
}
```

### Company Object

```json
{
  "name": "Tech Company DMCC",
  "domain": "techcompany.com",
  "industry": "Information Technology",
  "employeeCount": 150,
  "employeeRange": "51-200",
  "revenue": "$10M-$50M",
  "website": "https://techcompany.com",
  "city": "Dubai",
  "country": "United Arab Emirates",
  "technologies": ["Salesforce", "AWS", "React"],
  "executives": [...],
  "executiveCount": 5
}
```

---

## Best Practices

### 1. Start Small
Test with 5-10 companies before running large campaigns:

```bash
node scripts/tests/apollo-executive-test.js
```

### 2. Monitor Credits
Check credit usage in the scraper stats:

```javascript
const stats = scraper.getStats();
console.log(`Credits used: ${stats.creditsUsed}`);
```

### 3. Use Company Domain
For better match accuracy, provide the company domain:

```javascript
await scraper.searchPeople({
    companyDomain: 'company.com', // Better than just name
    companyName: 'Company Name'
});
```

### 4. Batch Processing
Process companies in batches with delays:

```javascript
for (let i = 0; i < companies.length; i++) {
    await scraper.searchPeople({ companyName: companies[i].name });
    
    if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 5000)); // 5s delay every 10 companies
    }
}
```

### 5. Handle Empty Results
Not all companies will have contacts on Apollo:

```javascript
const result = await scraper.searchPeople({ companyName: 'XYZ Corp' });

if (result.contacts.length === 0) {
    console.log('No executives found - company may not be in Apollo database');
}
```

---

## Troubleshooting

### Error: "API key is required"

**Solution:**
```bash
# Check if environment variable is set
echo $env:APOLLO_API_KEY

# Set it if missing
$env:APOLLO_API_KEY="your_key_here"
```

### Error: "Rate limit exceeded"

**Solution:** Reduce `rateLimit` option or upgrade your Apollo plan.

```javascript
const scraper = new ApolloScraper({
    rateLimit: 10 // Lower for free plan
});
```

### Error: "Credits exhausted"

**Solution:** Wait for credit reset (monthly) or upgrade plan.

### No Results Found

**Possible causes:**
1. Company not in Apollo database
2. Incorrect company name/domain
3. No executives in specified location
4. Seniority level too restrictive

**Try:**
- Use company domain instead of name
- Expand seniority levels: `['founder', 'c_suite', 'vp', 'director', 'manager']`
- Check company exists on Apollo.io website first

---

## Integration with Existing Workflows

### Add to Multi-Source Aggregator

```javascript
const MultiSourceAggregator = require('./src/data-sources/multi-source-aggregator');
const ApolloScraper = require('./src/data-sources/apollo-scraper');

const aggregator = new MultiSourceAggregator({
    sources: ['google_maps', 'apollo'],
    apollo: {
        apiKey: process.env.APOLLO_API_KEY
    }
});
```

### Push to Odoo CRM with Executive Contacts

Update your webhook to include executive fields:

```python
# Odoo automation rule
lead_data = {
    'name': data.get('name'),
    'contact_name': data.get('primaryContact', {}).get('name'),
    'title_action': data.get('primaryContact', {}).get('title'),
    'email_from': data.get('primaryContact', {}).get('email'),
    'phone': data.get('primaryContact', {}).get('phone'),
    'linkedin_url': data.get('primaryContact', {}).get('linkedinUrl'),
    # ... other fields
}
```

---

## Examples

### Find All C-Suite in Dubai Tech Companies

```javascript
const scraper = new ApolloScraper({ apiKey: process.env.APOLLO_API_KEY });
await scraper.initialize();

const result = await scraper.searchPeople({
    location: ['Dubai', 'United Arab Emirates'],
    titles: ['CEO', 'CTO', 'CIO', 'CFO'],
    seniorityLevels: ['c_suite'],
    perPage: 50
});

console.log(`Found ${result.contacts.length} C-level executives`);
```

### Enrich Existing Lead List

```javascript
const existingLeads = [...]; // Your existing leads from Google Maps

for (const lead of existingLeads) {
    const executives = await scraper.searchPeople({
        companyName: lead.name,
        location: ['Dubai'],
        seniorityLevels: ['founder', 'c_suite', 'vp'],
        perPage: 5
    });
    
    lead.executives = executives.contacts;
    lead.hasDecisionMaker = executives.contacts.length > 0;
}
```

---

## FAQ

**Q: How accurate is the contact data?**  
A: Apollo maintains high accuracy (90%+) through verification processes. Always verify critical contacts.

**Q: Can I search without a company?**  
A: Yes, use location + title filters to find executives in a region.

**Q: Is this GDPR compliant?**  
A: Apollo is GDPR compliant. Ensure your usage complies with local regulations.

**Q: What's the difference between searchPeople and enrichPerson?**  
A: `searchPeople` finds contacts matching criteria. `enrichPerson` gets details for a specific known person.

**Q: Can I export to CSV?**  
A: Yes! Results are automatically saved in JSON and CSV formats.

---

## Support

- **Apollo API Docs**: https://apolloio.github.io/apollo-api-docs/
- **Rate Limits**: Check your Apollo dashboard
- **Issues**: Open an issue in this repository

---

## Next Steps

1. ✅ Get Apollo API key
2. ✅ Run quick test: `node scripts/tests/apollo-executive-test.js`
3. ✅ Review results in `results/` directory
4. ✅ Run combined campaign: `node scripts/campaigns/apollo-combined-campaign.js`
5. ✅ Integrate with your CRM workflow

**Ready to find decision makers? Start scraping!** 🚀
