# Dubai SME Scraper - AI Agent Instructions

## Project Overview
A professional-grade lead generation system that scrapes Dubai businesses from Google Maps, enriches data with AI intelligence, and pushes leads to Odoo 17/18 CRM via webhooks. Built for Apify platform deployment with local development support.

**Core Purpose**: Automate B2B lead acquisition for companies needing ERP implementation, business automation, AI integration, and digital transformation services in Dubai/UAE market.

## Architecture & Data Flow

### 1. Three-Tier Scraping Pipeline
```
Google Maps Scraper → AI Enhancement → CRM Integration
     (Playwright)      (OpenAI GPT-4)    (Odoo Webhooks)
```

**Key Files**:
- `src/scraper.js` - Core `GoogleMapsScraper` class using Playwright
- `src/ai-intelligence.js` - `AIBusinessIntelligence` for lead scoring & classification
- `src/integrations/n8n-webhook.js` - `N8nWebhookIntegration` for Odoo push
- `odoo_crm_connector.py` - XML-RPC fallback connector

### 2. Dual Runtime Environments
- **Apify Actor**: Containerized deployment (`Dockerfile`, `.actor/actor.json`)
- **Local Development**: Direct Node.js execution (`node <script>.js`)

**Critical**: Always test with Apify SDK locally before deploying actors.

### 3. Data Sources Architecture
Located in `src/data-sources/`:
- `base-scraper.js` - Abstract base class for all scrapers
- `multi-source-aggregator.js` - Combines data from multiple sources
- `enhanced-multi-source-mapper.js` - Normalizes heterogeneous data formats
- `advanced-lead-scorer.js` - Multi-criteria quality scoring (0-100 scale)

## Critical Developer Workflows

### Running Scrapers (Local)
```bash
# Quick test (5 leads)
node scripts/tests/quick-test.js

# Comprehensive campaign (100+ leads, 2 hours)
node scripts/campaigns/extended-lead-campaign.js

# Production run with CRM push
python scripts/utilities/run_complete_process.py  # Python orchestrator
```

**Always check `config/crm_config.json`** before production runs - webhook URL must match Odoo instance.

### Odoo Webhook Integration Pattern
1. **Configure** `config/crm_config.json`:
   ```json
   {
     "crm_type": "webhook",
     "credentials": { "webhook_url": "http://[odoo-instance]/web/hook/[uuid]" },
     "push_settings": { "real_time": true, "batch_at_end": true }
   }
   ```

2. **Odoo Side Setup** (paste into Automation Rule > Server Action):
   - See `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt` for exact Python code
   - Use `odoo-integration/webhook-handlers/odoo_webhook_automation.py` as reference template
   - **Critical**: Target Record field must have `env['crm.lead'].create({})` to avoid 500 errors

3. **Lead Filtering Logic**:
   - Push to CRM: Has phone OR email (not "Not available" or empty)
   - Save to CSV: ALL leads regardless of completeness
   - Quality threshold: Configurable in `dataQualityLevel` input parameter

### Testing Webhooks
```bash
# Test webhook connectivity
python odoo-integration/tests/quick_webhook_test.py

# Test with sample lead data
python odoo-integration/tests/webhook_tester.py
```

## Project-Specific Patterns

### 1. Browser Management (Playwright)
```javascript
// Pattern: Always initialize before use, cleanup in finally block
const scraper = new GoogleMapsScraper({
    headless: true,
    maxConcurrency: 1,  // Use 1 for stability, 3 for speed
    requestDelay: 4000,  // 4s for data-rich extraction
    timeout: 20000
});
try {
    await scraper.initialize();
    // ... scraping logic
} finally {
    await scraper.close();
}
```

**Anti-pattern**: Never create multiple browser instances without closing previous ones (causes memory leaks).

### 2. Lead Quality Scoring
Defined in `src/utils.js::calculateQualityScore()`:
```javascript
// Scoring criteria (max 100 points)
// +30: Has name & address
// +20: Has phone
// +20: Has email  
// +15: Has website
// +10: Has rating
// +5:  Has reviews
```

Quality levels: `low` (≥30), `medium` (≥50), `high` (≥70)

### 3. Contact Extraction Utilities
Located in `src/utils.js`:
- `extractEmailsFromText(text)` - Regex-based email extraction from listing text
- `extractContactPersons(text)` - Detects "Owner", "Manager", "Contact Person"
- `parseLocationDetails(address)` - Parses UAE addresses into structured format
- `cleanPhoneNumber(phone)` - Normalizes +971 UAE phone formats

**Always use these utilities** instead of raw regex to maintain consistency.

### 4. Retry & Error Handling Pattern
```javascript
// Pattern used throughout codebase
await retryWithBackoff(async () => {
    return await page.click(selector);
}, 3, 1000);  // 3 attempts, 1s base delay (exponential backoff)
```

### 5. Memory Management for Large Runs
```javascript
// Pattern in extended campaigns
if (totalBusinesses.length % 50 === 0) {
    if (global.gc) global.gc();  // Force garbage collection
    const memUsage = getMemoryUsage();
    console.log(`Memory: ${memUsage.heapUsedMB}MB / ${memUsage.totalMB}MB`);
}
```

Run Node with `--expose-gc` flag for manual GC control.

## File Naming Conventions

### Scripts by Purpose
- `*-test.js` - Quick validation scripts (exit immediately)
- `*-scraper.js` - Standalone scraping implementations
- `*-generator.js` - Multi-category lead generation campaigns
- `*-campaign.js` - Extended runs (1-2 hours)
- `run_*.py` - Python orchestrators (often combine scraping + CRM push)

### Output Files
- `results/` - JSON outputs with timestamp: `[category]-[timestamp].json`
- CSV exports: Auto-generated from JSON using `convert-to-csv.js`

## Common Pitfalls & Solutions

### 1. Webhook 500 Errors
**Cause**: Missing `env['crm.lead'].create({})` in Odoo automation Target Record.  
**Fix**: See `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt` line 35-37.

### 2. Google Maps Selector Changes
**Symptoms**: `RESULT_ITEMS` returns 0 elements.  
**Fix**: Update selectors in `src/constants.js::GOOGLE_MAPS.SELECTORS`. Use browser DevTools to find current `.hfpxzc` or equivalent.

### 3. OpenAI Rate Limiting
**Solution**: `gpt-4o-mini` model used by default for cost optimization. Implement exponential backoff in `src/ai-intelligence.js`.

### 4. Apify Actor Deployment Failures
**Check**:
1. Dockerfile uses Alpine packages (`apk add chromium`)
2. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser`
3. Run `npx playwright install chromium` in Dockerfile

## Key Configuration Files

- `.actor/actor.json` - Apify actor manifest (input schema, categories, resource limits)
- `config/crm_config.json` - CRM integration settings (webhook URL, credentials)
- `package.json` - Scripts: `npm start`, `npm test`, `npm run lint`
- `src/constants.js` - Google Maps selectors, regex patterns, quality thresholds

## Testing Strategy

```bash
# Unit tests
npm run test:unit

# Integration tests (requires network)
npm run test:integration

# Local scraping test (validates full pipeline)
npm run test:local
```

**No comprehensive test coverage yet** - prioritize integration tests for critical paths (scraper → AI → webhook).

## Production Deployment Checklist

1. ✅ Update `config/crm_config.json` with production Odoo webhook URL
2. ✅ Set `OPENAI_API_KEY` in Apify actor secrets
3. ✅ Configure input schema in `.actor/actor.json`
4. ✅ Test webhook with `python odoo-integration/tests/quick_webhook_test.py`
5. ✅ Run pilot campaign: `node scripts/tests/quick-test.js` (5 leads)
6. ✅ Monitor memory usage for extended runs (check `getMemoryUsage()` output)
7. ✅ Deploy to Apify: `npm run build && npm run push`

## Dubai/UAE Specific Logic

### Business Categories
See `scripts/campaigns/comprehensive-lead-generator.js` lines 18-98 for curated category lists:
- Business Services (accounting, legal, consultants)
- Trading Companies (import/export, wholesale)
- Technology (IT, software, digital marketing)
- Healthcare (clinics, medical equipment)
- Construction (contractors, MEP, facility management)

### Location Parsing
`parseLocationDetails()` recognizes Dubai districts:
- Marina, Business Bay, DIFC, JLT, Downtown, Deira, Bur Dubai
- Extracts emirate, district, PO Box from Arabic/English addresses

### Phone Number Normalization
- UAE format: +971 (country code)
- Remove "Contact via website", "Not available" placeholders
- Standardize spacing: `+971 4 123 4567` (landline), `+971 50 123 4567` (mobile)

## When Making Changes

1. **Selector Updates**: Always update both primary and `_ALT` selectors in `constants.js`
2. **New Data Sources**: Extend `base-scraper.js`, add to `multi-source-aggregator.js`
3. **AI Prompts**: Keep prompts in `src/ai-intelligence.js` methods, not hardcoded in scrapers
4. **Odoo Integration**: Test locally with `webhook_tester.py` before deploying
5. **Quality Scoring**: Update `calculateQualityScore()` thresholds collaboratively with stakeholders

## Quick Reference

```bash
# Start local scraper
node src/main.js

# Run extended campaign (2 hours)
node scripts/campaigns/extended-lead-campaign.js

# Test Odoo webhook
python odoo-integration/tests/quick_webhook_test.py

# Convert JSON to CSV
node scripts/utilities/convert-to-csv.js results/[filename].json

# Deploy to Apify
npm run push

# Monitor live session (Python)
python scripts/utilities/live_scraper_monitor.py
```

## Workspace Organization

Files are now organized by use case:
- `/scripts/campaigns/` - Production lead generation campaigns
- `/scripts/tests/` - Test and validation scripts
- `/scripts/utilities/` - Helper scripts and orchestrators
- `/odoo-integration/` - Odoo CRM integration (webhooks, connectors, tests)
- `/config/` - Configuration files
- `/docs/guides/` - User guides and setup instructions
- `/docs/setup/` - Deployment and hosting guides

**See** `WORKSPACE_STRUCTURE.md` for complete directory reference.

**Questions?** Check `README.md` for architecture overview, `docs/guides/2-HOUR-CAMPAIGN-GUIDE.md` for operations guide, `docs/guides/COMPLETE_WEBHOOK_SETUP_GUIDE.txt` for Odoo integration.
