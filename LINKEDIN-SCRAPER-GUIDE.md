# LinkedIn People Scraper - Quick Start Guide

## ✅ What It Does

Searches LinkedIn for **real estate and property management executives** in Dubai:
- Property Managers
- Real Estate Directors
- Holiday Homes Managers
- Facilities Managers
- Operations Managers
- And more!

**Extracts:**
- ✅ Full name
- ✅ Job title
- ✅ Company name
- ✅ Location
- ✅ LinkedIn profile URL
- ✅ **Likely email addresses** (3 patterns per person)

---

## 🚀 Quick Start (2 Options)

### Option 1: With Your LinkedIn Login (Recommended)

**Step 1:** Add your LinkedIn credentials to `.env` file:
```bash
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
```

**Step 2:** Run the scraper:
```bash
npm run linkedin
```

It will automatically login and start scraping!

---

### Option 2: Manual Login (No Credentials Needed)

**Step 1:** Just run:
```bash
npm run linkedin
```

**Step 2:** When the browser opens:
1. Login to LinkedIn manually
2. Return to terminal
3. Press **Enter**
4. Scraper continues automatically!

---

## 📋 What Gets Scraped

### 16 Search Queries:

1. Property Manager Dubai
2. Property Management Director Dubai
3. Building Manager Dubai
4. Community Manager Dubai
5. Vacation Rental Manager Dubai
6. Holiday Homes Manager Dubai
7. Short-term Rental Manager Dubai
8. Airbnb Manager Dubai
9. Real Estate Director Dubai
10. Real Estate CEO Dubai
11. Real Estate Managing Director Dubai
12. Facilities Manager Dubai
13. FM Director Dubai
14. Estate Manager Dubai
15. Operations Manager Real Estate Dubai
16. Leasing Manager Dubai

**Expected:** 100-300+ executives depending on LinkedIn's limit

---

## 📊 Sample Output

### CSV Format:
```
Name,First Name,Last Name,Title,Company,Location,LinkedIn URL,Likely Email
Ahmed Al Mansouri,Ahmed,Al Mansouri,Property Manager,Emaar Properties,Dubai,https://linkedin.com/in/ahmed-almansouri,ahmed.almansouri@emaarproperties.com
Sarah Thompson,Sarah,Thompson,Operations Director,Vacation Homes Dubai,Dubai,https://linkedin.com/in/sarahthompson,sarah.thompson@vacationhomesdubai.com
```

### Email Patterns Generated:
For each person, 3 email patterns are generated:
1. `firstname.lastname@company.com`
2. `firstname@company.com`
3. `firstnamelastname@company.com`

You can verify these with Hunter.io or Snov.io!

---

## 💡 Pro Tips

### 1. LinkedIn Free Trial
Sign up for **LinkedIn Sales Navigator** (1-month free trial):
- More search results
- Better filters
- Direct InMail to contacts

### 2. Email Verification
Use the generated email patterns with:
- **Hunter.io** (25 free verifications/month)
- **NeverBounce** (Free tier available)
- **Snov.io** (50 free credits)

### 3. Combine with Google Maps Results
Match LinkedIn profiles with your Google Maps company data:
```javascript
// You have company name from Google Maps
// Find executives from LinkedIn for that company
```

### 4. Export to CRM
CSV file is ready for:
- Odoo CRM import
- Salesforce
- HubSpot
- Any CRM with CSV import

---

## ⚠️ Important Notes

### Rate Limiting
LinkedIn may limit searches if done too quickly. The scraper includes:
- 5-second delays between searches
- Automatic scroll throttling
- Human-like behavior

### Account Safety
- Use a real LinkedIn account
- Don't scrape 24/7
- 16 searches = ~30-45 minutes is safe
- Don't exceed 100 profile views per day

### CAPTCHA
If LinkedIn shows a CAPTCHA:
1. Complete it manually in the browser
2. Scraper will continue automatically

---

## 🎯 Next Steps After Scraping

### 1. Review the CSV
Open in Excel/Google Sheets, sort by company

### 2. Verify Emails
Use Hunter.io to verify the generated email patterns:
```bash
# Install Hunter.io Chrome extension
# Check emails one by one (25 free/month)
```

### 3. Enrich with Phone Numbers
Use the LinkedIn profiles to:
- Find phone numbers on their profiles
- Use RocketReach (5 free lookups)
- Use Lusha Chrome extension

### 4. Outreach
**Email Template:**
```
Subject: Property Management Solutions for [Company]

Hi [First Name],

I noticed you're managing properties at [Company] in Dubai. 

We help property management companies like yours automate 
tenant management, maintenance tracking, and financial reporting.

Would you be open to a 15-minute call next week?

Best regards,
[Your Name]
```

---

## 🔧 Troubleshooting

### "Browser not opening"
Make sure Playwright is installed:
```bash
npm install
npx playwright install chromium
```

### "Login failed"
- Check credentials in `.env` file
- Try manual login (Option 2 above)
- Make sure account is active

### "No results found"
- Check LinkedIn account is logged in
- Try more generic search terms
- Increase scroll attempts in code

### "Rate limited"
- Wait 1 hour
- Use Sales Navigator trial
- Reduce search frequency

---

## 📈 Expected Results

| Metric | Expected |
|--------|----------|
| Total Searches | 16 |
| Profiles per Search | 5-20 |
| Total Unique Profiles | 100-300 |
| With Email Patterns | 100% |
| Time to Complete | 30-45 min |

---

## 🎉 Ready to Run!

```bash
npm run linkedin
```

**The scraper will:**
1. Open LinkedIn in browser
2. Login (auto or manual)
3. Search 16 executive categories
4. Extract profiles + emails
5. Save to CSV + JSON
6. Show summary report

**Output files:**
- `results/linkedin-real-estate-executives-[timestamp].csv`
- `results/linkedin-real-estate-executives-[timestamp].json`

---

## 💼 Best Use Cases

✅ **B2B Lead Generation** - Find decision makers directly  
✅ **ERP Sales** - Target property management leaders  
✅ **Software Sales** - Reach operations managers  
✅ **Recruitment** - Identify talent in real estate sector  
✅ **Partnership Outreach** - Connect with industry leaders  

---

## 🆓 Free Tools to Combine

1. **LinkedIn Free** - 5-10 search results per query
2. **LinkedIn Sales Navigator Trial** - 1 month free, 25 InMails
3. **Hunter.io Free** - 25 email verifications/month
4. **RocketReach Free** - 5 contact lookups/month
5. **Snov.io Free** - 50 credits/month

**Total Cost: $0 for first month!**

---

## Questions?

Run the scraper and check the output. All contact information will be in the CSV file ready for your outreach campaigns!
