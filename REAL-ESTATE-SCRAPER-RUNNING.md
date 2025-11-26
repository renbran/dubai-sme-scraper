# Real Estate & Property Management Executive Scraper - READY! ✅

## What It Does

Scrapes **real estate, property management, holiday homes, and rental property companies** from Google Maps in Dubai with direct contact information.

## Quick Start

```bash
npm run realestate
```

**Currently Running!** Check terminal for live progress.

## Target Sectors

✅ **Property Management** - Building managers, community management  
✅ **Holiday Homes** - Vacation rentals, short-term rentals, Airbnb management  
✅ **Rental Services** - Lease management, tenant services  
✅ **Real Estate Agencies** - Brokers, consultants, advisors  
✅ **Facilities Management** - Estate management, FM companies  

## What You Get

### Direct Contact Information:
- 📞 Phone numbers
- 📧 Email addresses
- 🌐 Websites
- 📍 Physical addresses
- ⭐ Ratings & reviews

### Potential Executive Titles:
- Managing Director
- Property Manager
- Operations Manager
- CEO / Founder (for larger companies)
- Vacation Rental Manager
- Leasing Manager
- Facilities Manager
- General Manager

### Lead Quality Scoring (0-100):
- **High (70+)**: Has phone, email, website, good rating
- **Medium (40-69)**: Has 2+ contact methods
- **Low (<40)**: Limited contact info

## Output Files

Results saved in `results/` directory:

- `real-estate-property-mgmt-leads-[timestamp].json` - Full data
- `real-estate-property-mgmt-leads-[timestamp].csv` - Spreadsheet format

## 18 Categories Being Scraped

1. property management company in Dubai
2. property manager in Dubai Marina
3. property management Dubai Downtown
4. building management Dubai
5. holiday homes Dubai
6. vacation rentals Dubai
7. short term rental Dubai
8. Airbnb management Dubai
9. serviced apartments Dubai
10. rental management Dubai
11. lease management Dubai
12. tenant management Dubai
13. real estate agency Dubai
14. real estate broker Dubai
15. property consultant Dubai
16. facilities management Dubai
17. estate management Dubai
18. community management Dubai

**~15 companies per category = ~270 leads total**

## Sample Output

```json
{
  "businessName": "ABC Property Management",
  "address": "Dubai Marina, Dubai",
  "phone": "+971 4 123 4567",
  "email": "info@abcproperty.ae",
  "website": "https://abcproperty.ae",
  "rating": 4.5,
  "reviewCount": 85,
  "category": "property management company in Dubai",
  "sector": "Real Estate & Property Management",
  "contactScore": 85,
  "hasDirectContact": true,
  "potentialExecutives": [
    "Managing Director",
    "Property Manager",
    "Operations Manager",
    "Senior Property Manager"
  ]
}
```

## How to Use the Results

### 1. Open CSV in Excel/Google Sheets
Sort by "Contact Score" (highest first)

### 2. Cold Calling Strategy
```
"Hi, I'm calling from [Your Company]. 
Is the [Property Manager/Managing Director] available? 
I'd like to discuss [ERP/automation/business solution] 
for your property management operations."
```

### 3. Email Outreach
Use emails from CSV to send targeted campaigns about:
- Property management software
- Tenant portal systems
- Facilities management solutions
- Business automation
- ERP implementation

### 4. LinkedIn Research
Use company names to find actual executives on LinkedIn:
1. Search "[Company Name] property manager"
2. Filter by location: Dubai
3. Connect with decision makers

## Why This Works Better Than Apollo Free Plan

✅ **No API limits** - Scrape as much as you want  
✅ **Direct contact info** - Phone, email, website  
✅ **Real businesses** - Active Google Maps listings  
✅ **Dubai-focused** - All results are UAE-based  
✅ **Free** - No credits, no subscriptions  

## Campaign Progress

Watch the terminal for real-time progress:
- Category being processed
- Businesses found per category
- Contact details extracted
- Quality scores calculated

## After Completion

Campaign will show:
- ✅ Total businesses found
- ✅ Businesses with contact info
- ✅ Quality breakdown (high/medium/low)
- ✅ Top 15 leads by contact score
- ✅ File paths for results

## Next Steps After Scraping

1. ✅ **Review Results** - Open CSV file
2. ✅ **Filter High-Quality** - Sort by contact score (≥70)
3. ✅ **LinkedIn Lookup** - Find specific executives
4. ✅ **Start Outreach** - Call/email top leads
5. ✅ **CRM Integration** - Import to Odoo/Salesforce

## Estimated Time

~30-45 minutes for all 18 categories (270+ leads)

## Monitoring Live Progress

The terminal shows:
```
[2025-11-26 17:43:47] Starting search for: "property management company in Dubai"
[2025-11-26 17:43:52] Found 15 business elements, collected 0 businesses
[2025-11-26 17:43:53] Extracted: ABC Property Management
```

## Troubleshooting

**If scraper stops:**
```bash
# Just restart it
npm run realestate
```

**If you need more results:**
Edit `scripts/campaigns/real-estate-gmaps-campaign.js`:
```javascript
maxResults: 20  // Change from 15 to 20
```

**Add more categories:**
Add to `REAL_ESTATE_CATEGORIES` array in the script.

---

## 🎯 Current Status: RUNNING

Your real estate lead generation campaign is active!

Check terminal for live updates. Results will be saved automatically when complete.

**Perfect for:** ERP sales, property management software, facilities management solutions, business automation tools.
