# CRM Integration Guide

## Supported CRM Platforms

1. **HubSpot**
2. **Salesforce**
3. **Zoho CRM**
4. **Generic Webhook** (works with any CRM that accepts webhooks)

## Configuration

Edit `crm_config.json` to configure your CRM:

### HubSpot Example
```json
{
  "enabled": true,
  "crm_type": "hubspot",
  "credentials": {
    "api_key": "your-hubspot-api-key"
  },
  "push_settings": {
    "real_time": true,
    "batch_at_end": true,
    "retry_on_failure": true,
    "max_retries": 3
  }
}
```

### Salesforce Example
```json
{
  "enabled": true,
  "crm_type": "salesforce",
  "credentials": {
    "instance_url": "https://your-instance.salesforce.com",
    "access_token": "your-access-token"
  }
}
```

### Zoho CRM Example
```json
{
  "enabled": true,
  "crm_type": "zoho",
  "credentials": {
    "access_token": "your-zoho-access-token",
    "api_domain": "https://www.zohoapis.com"
  }
}
```

### Generic Webhook Example
```json
{
  "enabled": true,
  "crm_type": "webhook",
  "credentials": {
    "webhook_url": "https://your-crm.com/api/leads",
    "auth_header": "Bearer YOUR_API_KEY"
  }
}
```

## Features

- ✅ Real-time lead pushing (after each scrape)
- ✅ Batch pushing at session end
- ✅ Automatic retry on failure
- ✅ Support for multiple CRM platforms
- ✅ Easy configuration via JSON file

## Usage

1. Edit `crm_config.json` with your CRM credentials
2. Set `"enabled": true`
3. Run the scraper: `python google_maps_scraper.py`
4. Leads will be automatically pushed to your CRM!
