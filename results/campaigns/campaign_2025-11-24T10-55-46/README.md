# Campaign Run: 2025-11-24T10-55-46

## Campaign Details
- **Name**: HR Outsourcing - Apify Campaign
- **Date**: 2025-11-24T10:55:46.357Z
- **Duration**: 3 minutes
- **Apify Run ID**: nf1k8qZzTJOAQfWSv

## Results Summary
- **Total Businesses Scraped**: 546
- **Qualified Leads**: 500
- **With Email**: 0
- **With Phone**: 500

## Priority Distribution
- **HIGH**: 89 leads
- **MEDIUM**: 331 leads
- **URGENT**: 0 leads

## Rejection Reasons
- **No Phone**: 46
- **Low Score**: 0

## Industries Targeted
Construction, Electromechanical, Packaging

## Locations Covered
Business Bay, JVC, JLT, Downtown, DIFC

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
