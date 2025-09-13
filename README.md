# Dubai SME Scraper - Professional Apify Actor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Apify](https://img.shields.io/badge/Apify-Actor-blue)](https://apify.com/)

A professional-grade Apify actor that scrapes Small and Medium Enterprises (SMEs) in Dubai from Google Maps, automatically extracts contact information, and exports the data to Google Sheets.

## 🌟 Features

### Core Functionality

- **Comprehensive Business Data Extraction**: Names, addresses, phone numbers, websites, ratings, and reviews
- **Enhanced Contact Information**: Email addresses, contact persons, and detailed location parsing
- **Google Maps Integration**: Advanced scraping with multi-strategy clicking and element detection
- **Google Sheets Export**: Automatic data export with customizable spreadsheet integration
- **Real Estate Specialization**: Optimized for real estate brokerage companies and property businesses

### Advanced Capabilities

- **Data Quality Control**: Configurable quality levels with intelligent filtering
- **Duplicate Detection**: Advanced deduplication using multiple business identifiers
- **Memory Management**: Automatic garbage collection and resource optimization
- **Error Recovery**: Robust retry mechanisms with exponential backoff
- **UAE Business Focus**: Specialized parsing for Dubai and UAE business data

### Contact Extraction Features

- **Email Detection**: Advanced regex patterns for email extraction from business listings
- **Contact Person Identification**: Owner, manager, and contact person detection
- **Location Parsing**: Detailed address parsing for UAE locations
- **Multi-source Data**: Combines information from multiple Google Maps elements

## 📋 Prerequisites

- Node.js 16+ (Required for modern JavaScript features)
- Apify account (Free tier available)
- Google Cloud Platform account with Sheets API enabled
- Valid Google service account credentials

## 🚀 Quick Start

### 1. Setup Google Sheets API

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Sheets API
3. Create a service account and download the JSON key file
4. Share your target Google Sheet with the service account email
5. Upload the service account key to Apify's Key-Value Store

### 2. Configuration

The actor accepts the following input parameters:

```json
{
  "categories": [
    "real estate companies Dubai",
    "property management Dubai",
    "construction companies Dubai"
  ],
  "maxResultsPerCategory": 50,
  "dataQualityLevel": "medium",
  "googleSheetsConfig": {
    "spreadsheetId": "your-spreadsheet-id",
    "serviceAccountKeyName": "google-service-account"
  }
}
```

### 3. Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `categories` | Array<string> | Yes | - | Business categories to search for |
| `maxResultsPerCategory` | Number | No | 50 | Maximum results per category |
| `dataQualityLevel` | String | No | "medium" | Quality filter: "low", "medium", "high" |
| `googleSheetsConfig.spreadsheetId` | String | Yes | - | Target Google Sheets ID |
| `googleSheetsConfig.serviceAccountKeyName` | String | Yes | - | Key name in Apify Key-Value Store |

### 4. Data Quality Levels

- **Low (score ≥ 30)**: Basic business information with name and address
- **Medium (score ≥ 50)**: Includes contact information (phone/website)
- **High (score ≥ 70)**: Complete business profiles with multiple contact methods

## 📊 Output Format

The actor exports data to Google Sheets with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Business Name | Company name | "Emirates Real Estate" |
| Address | Full business address | "Dubai Marina, Dubai, UAE" |
| Phone | Contact phone number | "+971 4 123 4567" |
| Website | Business website | "www.company.com" |
| Rating | Google Maps rating | "4.5" |
| Reviews | Number of reviews | "123" |
| Category | Business category | "Real Estate" |
| Data Quality Score | Quality assessment | "75" |
| Email | Extracted email address | "info@company.com" |
| Contact Person | Contact person name | "Ahmed Al-Mansouri" |
| Location Details | Parsed location info | "Marina District" |
| Additional Phones | Secondary contacts | "+971 50 123 4567" |

## 🛠️ Development

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd apify_actor
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env file (not tracked in git)
echo "GOOGLE_SERVICE_ACCOUNT_KEY=your-key-here" > .env
```

4. Run locally:

```bash
npm start
```

### Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:live        # Live scraping tests (requires network)

# Test coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗️ Architecture

### Project Structure

```
apify_actor/
├── .actor/               # Apify actor configuration
│   ├── actor.json       # Actor metadata and input schema
│   └── Dockerfile       # Container configuration
├── src/                 # Source code
│   ├── main.js         # Main actor entry point
│   ├── scraper.js      # Google Maps scraping logic
│   ├── google-sheets.js # Google Sheets integration
│   ├── utils.js        # Utility functions and contact extraction
│   └── constants.js    # Configuration constants
├── test/               # Test suites
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── live/          # Live scraping tests
├── docs/              # Documentation
└── package.json       # Dependencies and scripts
```

### Key Components

- **Scraper Engine**: Playwright-based browser automation with advanced element detection
- **Contact Extractor**: Specialized utilities for UAE business contact information
- **Google Sheets Client**: Robust API integration with error handling and batch operations
- **Quality Controller**: Multi-criteria business data validation and scoring
- **Memory Manager**: Resource optimization for large-scale scraping operations

## 🔧 Advanced Configuration

### Custom Selectors

The scraper uses advanced CSS selectors optimized for Google Maps:

```javascript
// Business listings
BUSINESS_SELECTOR: '.hfpxzc',
// Business details
BUSINESS_NAME_SELECTOR: '[data-value="Business name"]',
// Enhanced selectors for contact extraction
PHONE_SELECTORS: [
  '[data-value="Phone number"]',
  'button[data-value*="Call"]',
  '.rogA2c .fontBodyMedium'
]
```

### Memory Optimization

The actor includes automatic memory management:

```javascript
// Automatic garbage collection at 85% memory usage
if (memUsage.heapUsed / memUsage.heapTotal > 0.85) {
    global.gc();
}
```

### Error Handling

Comprehensive error recovery with exponential backoff:

```javascript
// Retry configuration
const maxRetries = 3;
const baseDelay = 2000;
const backoffMultiplier = 2;
```

## 📈 Performance Metrics

### Typical Performance

- **Extraction Rate**: 10-15 businesses per minute
- **Success Rate**: 95%+ for well-populated areas
- **Memory Usage**: ~200-300MB peak
- **Data Quality**: Average 65/100 score

### Optimization Tips

1. Use specific business categories for better results
2. Set appropriate `maxResultsPerCategory` (50-100 recommended)
3. Monitor memory usage for large scraping jobs
4. Use "medium" quality level for balanced speed/accuracy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

### Development Guidelines

- Follow ESLint configuration
- Add tests for new features
- Update documentation for API changes
- Use semantic commit messages
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **"Google Sheets API error"**: Verify service account permissions and spreadsheet sharing
2. **"No businesses found"**: Check category names and try broader search terms
3. **"Memory limit exceeded"**: Reduce `maxResultsPerCategory` or enable garbage collection
4. **"Timeout errors"**: Increase retry delays or reduce concurrent operations

### Getting Help

- Check the [documentation](docs/) for detailed guides
- Review [test files](test/) for usage examples
- Open an issue for bugs or feature requests
- Contact support for Apify-specific questions

### Performance Troubleshooting

1. **Slow extraction**: 
   - Reduce `maxResultsPerCategory`
   - Use more specific categories
   - Check network connectivity

2. **High memory usage**:
   - Enable garbage collection
   - Process categories sequentially
   - Monitor browser resource usage

3. **Low data quality**:
   - Adjust quality level settings
   - Verify Google Maps source data
   - Check selector configuration

## 🔄 Version History

- **v1.0.0**: Initial release with basic scraping
- **v1.1.0**: Added Google Sheets integration
- **v1.2.0**: Enhanced contact extraction and UAE business focus
- **v1.3.0**: Added comprehensive testing and live validation
- **v1.4.0**: Performance optimization and memory management

---

Built with ❤️ for the Dubai business community using [Apify](https://apify.com/) and modern web scraping technologies.