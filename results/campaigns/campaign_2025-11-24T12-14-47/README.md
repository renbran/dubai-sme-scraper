# Campaign Run: 2025-11-24T12-14-47

## Campaign Details
- **Name**: Real Estate - Deira Area Campaign (Phase 1)
- **Date**: 2025-11-24T12:14:47.326Z
- **Duration**: 3 minutes
- **Apify Run ID**: 9ibulS7049G1Y2YjT

## Results Summary
- **Total Businesses Scraped**: 452
- **Qualified Leads**: 417
- **With Email**: 0
- **With Phone**: 417

## Priority Distribution
- **HIGH**: 32 leads
- **MEDIUM**: 280 leads
- **URGENT**: 0 leads

## Rejection Reasons
- **No Phone**: 35
- **Low Score**: 0

## Industries Targeted
Real Estate, Property Management, Rental Homes, Holiday Homes, Real Estate Developer, Real Estate Valuation, Realtor, Realty

## Locations Covered
Deira, Burjuman, Al Rigga, Bur Dubai, Al Karama, Al Mankhool, Port Saeed

## Files in This Folder
- `campaign_data.json` - Complete raw data with all businesses
- `campaign_leads.csv` - Qualified leads ready for import
- `campaign_data_with_emails.json` - Data with email extraction attempts (if available)
- `campaign_leads_with_emails.csv` - Leads CSV with email column (if available)

## Notes
- Phone numbers are mandatory for all qualified leads
- Email extraction from Google Maps has ~0% success rate (expected)
- Use phone-first outreach or email enrichment services for emails
- Import to CRM: `python odoo-integration/bulk_import_leads.py campaign_leads.csv`
