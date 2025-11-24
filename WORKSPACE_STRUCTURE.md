# 📁 Workspace Organization Guide

## Overview
This workspace has been organized into logical folders by use case for better maintainability and clarity.

## 📂 Directory Structure

### `/src/` - Core Application Code
**Purpose**: Main application source code and modules
- `main.js` - Apify actor entry point
- `scraper.js` - Google Maps scraper engine (Playwright)
- `ai-intelligence.js` - OpenAI integration for lead scoring
- `utils.js` - Utility functions (contact extraction, quality scoring)
- `constants.js` - Configuration constants and selectors
- `/data-sources/` - Multi-source scraping architecture
- `/integrations/` - External integrations (n8n webhooks)

### `/scripts/` - Executable Scripts

#### `/scripts/campaigns/` - Lead Generation Campaigns
**Purpose**: Production and extended lead collection scripts
- `comprehensive-lead-generator.js` - Multi-category campaign
- `extended-lead-campaign.js` - 2-hour campaign (100+ leads)
- `robust-lead-campaign.js` - Stable version with fresh browsers
- `high-value-lead-generator.js` - High-quality lead targeting
- `massive-lead-generator.js` - Large-scale operations
- `ultra-lead-generator.js` - Ultra-targeted campaigns
- `districts-lead-generator.js` - Location-based campaigns
- `series1-professional-services.js` - Professional services focus
- `series2-trading-digital.js` - Trading & tech focus
- `series3-realestate-construction.js` - Real estate & construction
- `run-ai-enhanced.js` - AI-enhanced scraping
- `run-large-dataset.js` - Large dataset processing
- `run-production.js` - Production runner

**Quick Start**: `node scripts/campaigns/comprehensive-lead-generator.js`

#### `/scripts/tests/` - Test & Validation Scripts
**Purpose**: Testing, debugging, and validation
- `quick-test.js` - Fast 5-lead test
- `test-scraper.js` - Basic scraper validation
- `test-webhook.js` - Webhook integration test
- `test-targeted-business.js` - Business intelligence test
- `test-*.js` - Various feature tests
- `debug-test.js` - Debugging utilities
- `demo-ai.js` - AI features demo
- `real-estate-*.js` - Real estate specific tests
- `live-scraping-test.js` - Live scraping validation

**Quick Test**: `node scripts/tests/quick-test.js`

#### `/scripts/utilities/` - Utility & Helper Scripts
**Purpose**: Data processing, conversion, and orchestration
- `convert-to-csv.js` - JSON to CSV converter
- `csv-exporter.js` - CSV export utilities
- `comprehensive-scraping-analysis.js` - Data analysis
- Python orchestrators:
  - `run_complete_process.py` - Complete pipeline orchestration
  - `complete_run.py` - Full run with CRM integration
  - `quick_start.py` - Quick start script
  - `bulk_import_leads.py` - Bulk lead import
  - `import_old_leads.py` - Historical data import
  - `send_old_leads.py` - Legacy lead sender
- Monitoring scripts:
  - `live_scraper_monitor.py` - Real-time monitoring
  - `scraper_status_monitor.py` - Status tracking
  - `session_monitor_2h.py` - 2-hour campaign monitor
- Deployment:
  - `digitalocean-quickstart.ps1` - DigitalOcean setup
  - `upload-to-vps.ps1` - VPS deployment
  - `vps-deploy.sh` - Linux VPS deployment
  - `run_*.bat` - Windows batch scripts

**Convert Data**: `node scripts/utilities/convert-to-csv.js results/data.json`

### `/odoo-integration/` - Odoo CRM Integration

#### `/odoo-integration/webhook-handlers/` - Webhook Handlers
**Purpose**: Odoo webhook automation code (paste into Odoo)
- `odoo_webhook_automation.py` - Complete automation rule
- `odoo_webhook_controller.py` - HTTP controller
- `webhook_handler_odoo.py` - Handler implementation
- `WEBHOOK_FIX_FOR_ODOO.py` - Fix for common issues
- `URGENT_WEBHOOK_*.py` - Quick fix scripts
- `COPY_PASTE_WEBHOOK.py` - Ready-to-paste code
- `COPY_TO_ODOO.py` - Direct Odoo integration

**Usage**: Copy code from these files into Odoo Automation Rules

#### `/odoo-integration/connectors/` - CRM Connectors
**Purpose**: XML-RPC and API connectors for Odoo
- `odoo_crm_connector.py` - Main XML-RPC connector
- `crm_connector.py` - Generic CRM connector
- `webhook_crm_connector.py` - Webhook-based connector
- `webhook_crm_config.py` - Configuration helper
- `WEBHOOK_CRM_SETUP_GUIDE.py` - Setup instructions

**Usage**: `from odoo_integration.connectors.odoo_crm_connector import OdooCRMConnector`

#### `/odoo-integration/tests/` - Integration Tests
**Purpose**: Test Odoo connectivity and webhooks
- `webhook_tester.py` - Test webhook endpoints
- `quick_webhook_test.py` - Fast connectivity check
- `test_webhook.py` - Comprehensive webhook test
- `webhook_monitor.py` - Monitor webhook status
- `webhook_diagnostics.py` - Debug webhook issues
- `test_filtering_logic.py` - Test lead filtering

**Quick Test**: `python odoo-integration/tests/quick_webhook_test.py`

### `/config/` - Configuration Files
**Purpose**: Application configuration
- `crm_config.json` - CRM integration settings (webhook URL, credentials)
- `simple_webhook_config.json` - Simple webhook config
- `deira-sme-input.json` - Sample input data

**⚠️ Important**: Update `crm_config.json` with your Odoo webhook URL before production runs

### `/docs/` - Documentation

#### `/docs/guides/` - User Guides
- `2-HOUR-CAMPAIGN-GUIDE.md` - Extended campaign operations
- `COMPLETE_WEBHOOK_SETUP_GUIDE.txt` - Step-by-step Odoo setup
- `ODOO_WEBHOOK_CONFIGURATION.txt` - Webhook configuration
- `CRM_FILTERING_SUMMARY.md` - Lead filtering logic

#### `/docs/setup/` - Setup & Deployment Guides
- `digitalocean-setup-guide.md` - DigitalOcean deployment
- `github-deployment-options.md` - GitHub deployment
- `vps-setup-guide.md` - VPS setup instructions
- `SELF_HOSTING.md` - Self-hosting guide
- `ENHANCED_FEATURES.md` - Feature documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `ONLINE-SCRAPING-CHALLENGES-ANALYSIS.md` - Technical challenges
- `FRESH-DATA-ACTION-REPORT.md` - Data freshness analysis

#### Root Documentation
- `README.md` - Main project documentation
- `README_CRM.md` - CRM integration overview
- `README_ODOO17.md` - Odoo 17 specific docs
- `target_profile.md` - Target customer profiles
- `gatemea.html` - Web resource

### `/results/` - Output Data
**Purpose**: Generated JSON and CSV files
- Timestamped JSON outputs: `[category]-[timestamp].json`
- Converted CSV files
- Historical run data

### `/.actor/` - Apify Actor Configuration
**Purpose**: Apify platform deployment
- `actor.json` - Actor manifest (input schema, categories)
- `Dockerfile` - Container configuration

### `/test/` - Test Suites
**Purpose**: Jest unit and integration tests
- `/unit/` - Unit tests
- `/integration/` - Integration tests
- `/live/` - Live scraping tests

## 🚀 Common Workflows

### 1. Quick Test (5 leads)
```bash
node scripts/tests/quick-test.js
```

### 2. Extended Campaign (100+ leads, 2 hours)
```bash
node scripts/campaigns/extended-lead-campaign.js
```

### 3. Test Odoo Webhook
```bash
python odoo-integration/tests/quick_webhook_test.py
```

### 4. Complete Production Run
```bash
python scripts/utilities/run_complete_process.py
```

### 5. Convert Results to CSV
```bash
node scripts/utilities/convert-to-csv.js results/output.json
```

### 6. Run Tests
```bash
npm test                    # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
```

### 7. Deploy to Apify
```bash
npm run build
npm run push
```

## 📝 Configuration Checklist

Before running production campaigns:

1. ✅ Update `config/crm_config.json` with your Odoo webhook URL
2. ✅ Set `OPENAI_API_KEY` environment variable (if using AI features)
3. ✅ Configure Odoo webhook handler (see `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt`)
4. ✅ Test webhook: `python odoo-integration/tests/quick_webhook_test.py`
5. ✅ Run pilot test: `node scripts/tests/quick-test.js`
6. ✅ Monitor memory for long runs

## 🔧 Development

### Adding New Features
1. Core functionality → `/src/`
2. Campaign scripts → `/scripts/campaigns/`
3. Tests → `/scripts/tests/` or `/test/`
4. Utilities → `/scripts/utilities/`
5. Odoo integration → `/odoo-integration/`

### File Naming Conventions
- `*-test.js` - Quick validation scripts
- `*-scraper.js` - Standalone scrapers
- `*-generator.js` - Multi-category campaigns
- `*-campaign.js` - Extended runs (1-2 hours)
- `run_*.py` - Python orchestrators

## 📊 Data Flow

```
Google Maps → src/scraper.js → src/ai-intelligence.js → Webhook → Odoo CRM
                                                       ↓
                                                    results/
                                                    (JSON/CSV)
```

## ⚠️ Important Notes

1. **Always check** `config/crm_config.json` before production runs
2. **Memory management**: Large campaigns need `--expose-gc` flag
3. **Webhook 500 errors**: Check Odoo Target Record field
4. **Google Maps selectors**: May change; update `src/constants.js`
5. **Rate limiting**: Use `requestDelay: 4000` for stability

## 🆘 Troubleshooting

| Issue | Solution | Reference |
|-------|----------|-----------|
| Webhook 500 errors | Check Odoo Target Record | `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt` |
| No leads found | Update selectors | `src/constants.js` |
| Memory issues | Use `--expose-gc` flag | `docs/guides/2-HOUR-CAMPAIGN-GUIDE.md` |
| Apify deployment fails | Check Dockerfile | `.actor/Dockerfile` |

## 📞 Quick Reference

- **Project Overview**: `README.md`
- **Odoo Setup**: `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt`
- **2-Hour Campaign**: `docs/guides/2-HOUR-CAMPAIGN-GUIDE.md`
- **CRM Integration**: `README_CRM.md`
- **AI Instructions**: `.github/copilot-instructions.md`

---

**Last Updated**: November 24, 2025  
**Workspace Version**: 2.0 (Organized Structure)
