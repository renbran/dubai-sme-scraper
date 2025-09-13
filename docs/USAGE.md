# Usage Guide - Dubai SME Business Scraper

This guide provides detailed instructions for using the Dubai SME Business Scraper effectively.

## Getting Started

### Basic Configuration

The minimal configuration requires only the business categories you want to scrape:

```json
{
  "categories": ["restaurants dubai", "tech companies dubai"]
}
```

### Advanced Configuration

For production use, configure all available options:

```json
{
  "categories": [
    "restaurants dubai marina",
    "consulting services business bay",
    "retail stores mall of emirates"
  ],
  "maxResultsPerCategory": 100,
  "dataQualityLevel": "premium",
  "searchRadius": "Dubai",
  "googleSheetsConfig": {
    "enabled": true,
    "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "sheetName": "Dubai_SMEs_2024",
    "serviceAccountKey": "{\"type\": \"service_account\", ...}",
    "appendMode": false,
    "createBackup": true
  },
  "proxyConfiguration": {
    "useApifyProxy": true,
    "proxyGroups": ["RESIDENTIAL"]
  },
  "concurrency": {
    "maxConcurrency": 3,
    "requestDelay": 3000,
    "retryAttempts": 5
  },
  "outputFormat": {
    "includePhotos": true,
    "includeReviews": false,
    "includeCoordinates": true,
    "includeSocialMedia": false
  }
}
```

## Data Quality Levels

### Basic Level
- Requires: Business name and address
- Use case: Large-scale data collection
- Expected quality score: 20-60

### Standard Level (Recommended)
- Requires: Business name, address, and quality score ≥40
- Use case: General business directory
- Expected quality score: 40-80

### Premium Level
- Requires: Business name, address, contact info, and quality score ≥70
- Use case: High-quality lead generation
- Expected quality score: 70-100

## Category Search Tips

### Effective Search Terms
```javascript
// Good - Specific and location-focused
"italian restaurants dubai marina"
"dental clinics jumeirah"
"law firms difc"

// Better - Include business type
"family restaurants downtown dubai"
"pediatric clinics dubai healthcare city"
"corporate law firms business bay"

// Best - Very specific
"fine dining seafood restaurants dubai marina walk"
"cosmetic dentistry clinics jumeirah beach road"
"international arbitration law firms difc"
```

### Search Radius Options
- `"Dubai"` - Entire Dubai emirate
- `"Dubai Marina"` - Specific area
- `"Downtown Dubai"` - Central business district
- `"Business Bay"` - Business district
- `"DIFC"` - Financial center
- `"JLT"` - Jumeirah Lakes Towers

## Google Sheets Integration

### Setup Steps

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable Google Sheets API

2. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file

3. **Prepare Spreadsheet**
   - Create new Google Sheet
   - Copy spreadsheet ID from URL
   - Share with service account email (Editor access)

4. **Configure Actor**
   ```json
   {
     "googleSheetsConfig": {
       "enabled": true,
       "spreadsheetId": "SPREADSHEET_ID_FROM_URL",
       "sheetName": "Dubai_SMEs",
       "serviceAccountKey": "PASTE_JSON_KEY_CONTENT_HERE"
     }
   }
   ```

### Sheet Structure

The actor creates a professionally formatted sheet with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Business Name | Company name | Al Mansour Restaurant |
| Category | Business type | Restaurant |
| Address | Full address | Marina Walk, Dubai Marina |
| Phone | UAE phone number | +971501234567 |
| Website | Business website | https://almansour.ae |
| Email | Contact email | info@almansour.ae |
| Rating | Google rating | 4.5 |
| Review Count | Number of reviews | 245 |
| Business Hours | Operating hours | Mon-Sun: 10:00-23:00 |
| Latitude | GPS coordinate | 25.0657 |
| Longitude | GPS coordinate | 55.1413 |
| Google Maps URL | Maps profile link | https://maps.google.com/... |
| Primary Photo URL | Main business image | https://images.google.com/... |
| Description | Business description | Authentic Lebanese cuisine |
| Price Range | Cost indicator | $$ |
| Last Updated | Scrape timestamp | 2024-01-15T10:30:00Z |
| Data Quality Score | Quality rating | 85 |
| Verification Status | Verification level | Verified |

## Performance Optimization

### For Speed (1000+ businesses/hour)
```json
{
  "dataQualityLevel": "basic",
  "concurrency": {
    "maxConcurrency": 5,
    "requestDelay": 1500,
    "retryAttempts": 3
  },
  "outputFormat": {
    "includePhotos": false,
    "includeReviews": false,
    "includeCoordinates": true,
    "includeSocialMedia": false
  }
}
```

### For Quality (500+ businesses/hour)
```json
{
  "dataQualityLevel": "premium",
  "concurrency": {
    "maxConcurrency": 2,
    "requestDelay": 4000,
    "retryAttempts": 5
  },
  "outputFormat": {
    "includePhotos": true,
    "includeReviews": true,
    "includeCoordinates": true,
    "includeSocialMedia": true
  }
}
```

### For Reliability (avoiding blocks)
```json
{
  "concurrency": {
    "maxConcurrency": 1,
    "requestDelay": 5000,
    "retryAttempts": 10
  },
  "proxyConfiguration": {
    "useApifyProxy": true,
    "proxyGroups": ["RESIDENTIAL"]
  }
}
```

## Common Use Cases

### 1. Restaurant Directory
```json
{
  "categories": [
    "restaurants dubai marina",
    "restaurants downtown dubai", 
    "restaurants jumeirah",
    "cafes dubai mall",
    "fine dining business bay"
  ],
  "maxResultsPerCategory": 150,
  "dataQualityLevel": "standard"
}
```

### 2. Professional Services
```json
{
  "categories": [
    "law firms difc",
    "accounting firms business bay",
    "consulting firms downtown dubai",
    "marketing agencies media city"
  ],
  "maxResultsPerCategory": 75,
  "dataQualityLevel": "premium"
}
```

### 3. Healthcare Directory
```json
{
  "categories": [
    "dental clinics dubai",
    "medical centers jumeirah",
    "hospitals dubai healthcare city",
    "pharmacies dubai marina"
  ],
  "maxResultsPerCategory": 200,
  "dataQualityLevel": "premium"
}
```

### 4. Retail and Shopping
```json
{
  "categories": [
    "electronics stores dubai mall",
    "fashion boutiques city walk",
    "furniture stores trade centre",
    "jewelry stores gold souk"
  ],
  "maxResultsPerCategory": 300,
  "dataQualityLevel": "basic"
}
```

## Monitoring and Debugging

### Log Levels
```bash
# Minimal logging
export APIFY_LOG_LEVEL=ERROR

# Standard logging (recommended)
export APIFY_LOG_LEVEL=INFO

# Detailed debugging
export APIFY_LOG_LEVEL=DEBUG
```

### Progress Tracking
The actor logs progress automatically:
```
[2024-01-15 10:30:15] Processing category 1/5: "restaurants dubai"
[2024-01-15 10:32:20] Extracted 45 businesses from "restaurants dubai"
[2024-01-15 10:32:25] Memory usage: 312MB / 456MB
```

### Error Handling
Common error scenarios and automatic handling:
- **Rate limiting**: Automatic exponential backoff
- **CAPTCHA detection**: Graceful failure with retry
- **Network errors**: Configurable retry attempts
- **Memory issues**: Automatic garbage collection

### Data Validation
Automatic quality checks:
- Phone number format validation
- UAE address verification
- Duplicate business detection
- Data completeness scoring

## Best Practices

### 1. Start Small
Begin with 1-2 categories and low limits to test configuration:
```json
{
  "categories": ["restaurants dubai marina"],
  "maxResultsPerCategory": 25
}
```

### 2. Use Specific Categories
More specific searches yield better results:
```javascript
// Generic (may get mixed results)
"restaurants dubai"

// Specific (better targeting)
"italian restaurants dubai marina"
```

### 3. Monitor Resource Usage
- Check memory usage in logs
- Reduce concurrency if memory issues occur
- Use quality filtering to manage data volume

### 4. Respect Rate Limits
- Use appropriate delays (2000ms minimum)
- Enable proxy rotation for large jobs
- Monitor for blocking indicators

### 5. Backup Your Data
- Enable Google Sheets backup feature
- Export data to multiple formats
- Keep service account credentials secure

## Troubleshooting Common Issues

### No Results Found
```json
// Try more general search terms
{
  "categories": ["restaurants dubai"]  // Instead of very specific terms
}
```

### Memory Issues
```json
// Reduce batch size and enable memory management
{
  "maxResultsPerCategory": 50,  // Smaller batches
  "concurrency": {
    "maxConcurrency": 1  // Single thread
  }
}
```

### Rate Limiting
```json
// Increase delays and reduce concurrency
{
  "concurrency": {
    "maxConcurrency": 1,
    "requestDelay": 5000,
    "retryAttempts": 10
  }
}
```

### Google Sheets Errors
- Verify service account has edit access
- Check spreadsheet ID is correct
- Ensure Google Sheets API is enabled
- Validate JSON key format

For more detailed troubleshooting, see the main README.md file.