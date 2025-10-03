# Odoo 17 CRM Integration Guide

## Setup

### 1. Configure Odoo 17 Credentials

Edit `crm_config.json`:

```json
{
  "enabled": true,
  "crm_type": "odoo17",
  "credentials": {
    "url": "http://localhost:8069",
    "db": "your_database_name",
    "username": "admin",
    "password": "your_password"
  },
  "push_settings": {
    "real_time": true,
    "batch_at_end": true,
    "retry_on_failure": true,
    "max_retries": 3
  }
}
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Scraper

```bash
python google_maps_scraper.py
```

## Features

- ✅ **Real-time Push**: Each lead is pushed to Odoo 17 CRM immediately after scraping
- ✅ **Batch Push**: All leads are pushed in batch at the end of session
- ✅ **Auto Tagging**: Automatically creates and assigns tags based on category and priority
- ✅ **Dubai Location**: Automatically sets city and country to Dubai, UAE
- ✅ **Quality Scoring**: Maps quality scores to Odoo priority levels
- ✅ **Retry Logic**: Automatically retries failed pushes up to 3 times

## Lead Fields Mapped

| Scraper Field | Odoo CRM Field |
|--------------|----------------|
| Name | name, contact_name |
| Phone | phone |
| Website | website |
| Address | street |
| Category | Tags (crm.tag) |
| Priority | priority (1-3) |
| Quality Score | Description |
| Search Term | Description |

## Running for 1 Hour

The scraper will:
1. Start Chrome browser
2. Search Google Maps for Dubai businesses
3. Extract contact details
4. Push each lead to Odoo 17 CRM in real-time
5. Run for exactly 1 hour
6. Save all leads to CSV
7. Push any remaining leads in batch to Odoo 17

## Verification

Check your Odoo 17 CRM dashboard at:
- **CRM > Leads** to see all scraped leads
- Leads will have tags like "Google Maps Lead", category name, and priority
- Each lead includes quality score and search term in description

## Troubleshooting

1. **Authentication Failed**: Check database name, username, and password
2. **Connection Error**: Ensure Odoo 17 is running on the specified URL
3. **XML-RPC Disabled**: Enable external API in Odoo settings
