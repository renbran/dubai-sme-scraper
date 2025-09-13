const Apify = require('apify');

const { PERFORMANCE } = require('./constants');
const GoogleSheetsManager = require('./google-sheets');
const GoogleMapsScraper = require('./scraper');
const { removeDuplicates, validateInput, getTimestamp, getMemoryUsage, sleep } = require('./utils');

/**
 * Main Apify Actor for Dubai SME Business Scraping
 * Orchestrates the complete workflow from input validation to data export
 */
class DubaiSMEActor {
    constructor() {
        this.input = null;
        this.scraper = null;
        this.sheetsManager = null;
        this.dataset = null;

        this.stats = {
            startTime: Date.now(),
            categoriesProcessed: 0,
            totalBusinesses: 0,
            uniqueBusinesses: 0,
            duplicatesRemoved: 0,
            sheetsExported: false,
            errors: []
        };
    }

    /**
     * Initialize the actor and validate inputs
     */
    async initialize() {
        console.log(`[${getTimestamp()}] ====== Dubai SME Scraper Starting ======`);
        console.log(`[${getTimestamp()}] Memory at start:`, getMemoryUsage());

        // Get and validate input
        this.input = await Apify.getInput();
        const validation = validateInput(this.input);

        if (!validation.isValid) {
            throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
        }

        console.log(`[${getTimestamp()}] Input validated successfully`);
        console.log(`[${getTimestamp()}] Categories to process: ${this.input.categories.length}`);
        console.log(`[${getTimestamp()}] Max results per category: ${this.input.maxResultsPerCategory}`);
        console.log(`[${getTimestamp()}] Data quality level: ${this.input.dataQualityLevel}`);

        // Initialize dataset
        this.dataset = await Apify.openDataset();

        // Initialize scraper
        const scraperOptions = {
            headless: true,
            maxConcurrency: this.input.concurrency?.maxConcurrency || 3,
            requestDelay: this.input.concurrency?.requestDelay || 2000,
            timeout: PERFORMANCE.DEFAULT_TIMEOUT,
            proxyConfig: this.input.proxyConfiguration?.useApifyProxy
                ? await Apify.createProxyConfiguration(this.input.proxyConfiguration) : null
        };

        this.scraper = new GoogleMapsScraper(scraperOptions);
        await this.scraper.initialize();

        // Initialize Google Sheets if enabled
        if (this.input.googleSheetsConfig?.enabled) {
            this.sheetsManager = new GoogleSheetsManager(this.input.googleSheetsConfig);

            // Test connection
            const testResult = await this.sheetsManager.testConnection();
            if (!testResult.success) {
                throw new Error(`Google Sheets connection failed: ${testResult.error}`);
            }
            console.log(`[${getTimestamp()}] Google Sheets connection verified`);
        }

        console.log(`[${getTimestamp()}] Actor initialization completed`);
    }

    /**
     * Main execution workflow
     */
    async run() {
        try {
            await this.initialize();

            const allBusinesses = [];
            const maxRetries = this.input.concurrency?.retryAttempts || 3;

            // Process each category
            for (let i = 0; i < this.input.categories.length; i++) {
                const category = this.input.categories[i];
                console.log(`[${getTimestamp()}] Processing category ${i + 1}/${this.input.categories.length}: "${category}"`);

                let categoryBusinesses = [];
                let retryCount = 0;

                while (retryCount < maxRetries) {
                    try {
                        categoryBusinesses = await this.scraper.searchBusinesses(
                            category,
                            this.input.maxResultsPerCategory
                        );
                        break; // Success, exit retry loop
                    } catch (error) {
                        retryCount++;
                        this.stats.errors.push({
                            category,
                            attempt: retryCount,
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });

                        if (retryCount < maxRetries) {
                            const delay = 5000 * retryCount; // Exponential backoff
                            console.log(`[${getTimestamp()}] Retry ${retryCount}/${maxRetries} for category "${category}" in ${delay}ms`);
                            await sleep(delay);
                        } else {
                            console.error(`[${getTimestamp()}] Failed to process category "${category}" after ${maxRetries} attempts`);
                        }
                    }
                }

                if (categoryBusinesses.length > 0) {
                    console.log(`[${getTimestamp()}] Extracted ${categoryBusinesses.length} businesses from "${category}"`);
                    allBusinesses.push(...categoryBusinesses);

                    // Save partial results to dataset
                    await this.dataset.pushData(categoryBusinesses);
                } else {
                    console.warn(`[${getTimestamp()}] No businesses found for category "${category}"`);
                }

                this.stats.categoriesProcessed++;
                this.stats.totalBusinesses = allBusinesses.length;

                // Memory management check
                const memUsage = getMemoryUsage();
                console.log(`[${getTimestamp()}] Memory usage: ${memUsage.heapUsed}MB / ${memUsage.rss}MB`);

                if (memUsage.heapUsed > PERFORMANCE.MEMORY_LIMIT_MB * 0.8) {
                    console.log(`[${getTimestamp()}] High memory usage detected, running garbage collection`);
                    if (global.gc) {
                        global.gc();
                    }
                }

                // Delay between categories to avoid rate limiting
                if (i < this.input.categories.length - 1) {
                    const delay = this.input.concurrency?.requestDelay || 2000;
                    console.log(`[${getTimestamp()}] Waiting ${delay}ms before next category...`);
                    await sleep(delay);
                }
            }

            // Process collected data
            await this.processData(allBusinesses);
        } catch (error) {
            console.error(`[${getTimestamp()}] Fatal error in actor execution:`, error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Process, clean, and export collected business data
     * @param {Array} businesses - Raw business data
     */
    async processData(businesses) {
        console.log(`[${getTimestamp()}] ====== Processing Collected Data ======`);
        console.log(`[${getTimestamp()}] Total businesses collected: ${businesses.length}`);

        if (businesses.length === 0) {
            console.log(`[${getTimestamp()}] No businesses to process`);
            return;
        }

        // Remove duplicates
        const uniqueBusinesses = removeDuplicates(businesses);
        this.stats.uniqueBusinesses = uniqueBusinesses.length;
        this.stats.duplicatesRemoved = businesses.length - uniqueBusinesses.length;

        console.log(`[${getTimestamp()}] Unique businesses after deduplication: ${uniqueBusinesses.length}`);
        console.log(`[${getTimestamp()}] Duplicates removed: ${this.stats.duplicatesRemoved}`);

        // Apply data quality filtering if specified
        const filteredBusinesses = this.applyQualityFilter(uniqueBusinesses);
        console.log(`[${getTimestamp()}] Businesses after quality filtering: ${filteredBusinesses.length}`);

        // Save final results to dataset
        await this.dataset.pushData({
            summary: {
                totalCategories: this.input.categories.length,
                totalBusinesses: this.stats.totalBusinesses,
                uniqueBusinesses: this.stats.uniqueBusinesses,
                duplicatesRemoved: this.stats.duplicatesRemoved,
                finalCount: filteredBusinesses.length,
                dataQualityLevel: this.input.dataQualityLevel,
                processedAt: new Date().toISOString()
            },
            businesses: filteredBusinesses
        });

        // Export to Google Sheets if enabled
        if (this.input.googleSheetsConfig?.enabled && this.sheetsManager) {
            await this.exportToGoogleSheets(filteredBusinesses);
        }

        // Log final statistics
        this.logFinalStats(filteredBusinesses);
    }

    /**
     * Apply data quality filtering based on user preferences
     * @param {Array} businesses - Business data to filter
     * @returns {Array} - Filtered business data
     */
    applyQualityFilter(businesses) {
        const qualityLevel = this.input.dataQualityLevel || 'standard';

        switch (qualityLevel) {
        case 'basic':
            // Minimal filtering - just require name and address
            return businesses.filter((b) => b.businessName && b.address);

        case 'premium':
            // High quality requirements
            return businesses.filter((b) => b.businessName
                    && b.address
                    && (b.phone || b.website)
                    && b.dataQualityScore >= 70
            );

        case 'standard':
        default:
            // Standard filtering - require basic contact info
            return businesses.filter((b) => b.businessName
                    && b.address
                    && b.dataQualityScore >= 40
            );
        }
    }

    /**
     * Export processed data to Google Sheets
     * @param {Array} businesses - Processed business data
     */
    async exportToGoogleSheets(businesses) {
        console.log(`[${getTimestamp()}] ====== Exporting to Google Sheets ======`);

        try {
            const result = await this.sheetsManager.writeData(businesses);

            if (result.success) {
                this.stats.sheetsExported = true;
                console.log(`[${getTimestamp()}] Successfully exported ${result.rowsWritten} rows to Google Sheets`);

                // Format the sheet
                await this.sheetsManager.formatSheet(this.input.googleSheetsConfig.sheetName);

                console.log(`[${getTimestamp()}] Google Sheets export completed successfully`);
            } else {
                throw new Error('Google Sheets export failed');
            }
        } catch (error) {
            console.error(`[${getTimestamp()}] Google Sheets export error:`, error.message);
            this.stats.errors.push({
                operation: 'GoogleSheetsExport',
                error: error.message,
                timestamp: new Date().toISOString()
            });

            // Don't throw error, just log it
            console.log(`[${getTimestamp()}] Continuing without Google Sheets export...`);
        }
    }

    /**
     * Log final statistics and performance metrics
     * @param {Array} finalBusinesses - Final processed business data
     */
    logFinalStats(finalBusinesses) {
        const runtime = Date.now() - this.stats.startTime;
        const runtimeMinutes = Math.round(runtime / 60000 * 100) / 100;

        console.log(`[${getTimestamp()}] ====== Final Statistics ======`);
        console.log(`[${getTimestamp()}] Runtime: ${runtimeMinutes} minutes`);
        console.log(`[${getTimestamp()}] Categories processed: ${this.stats.categoriesProcessed}/${this.input.categories.length}`);
        console.log(`[${getTimestamp()}] Total businesses found: ${this.stats.totalBusinesses}`);
        console.log(`[${getTimestamp()}] Unique businesses: ${this.stats.uniqueBusinesses}`);
        console.log(`[${getTimestamp()}] Duplicates removed: ${this.stats.duplicatesRemoved}`);
        console.log(`[${getTimestamp()}] Final business count: ${finalBusinesses.length}`);
        console.log(`[${getTimestamp()}] Google Sheets exported: ${this.stats.sheetsExported ? 'Yes' : 'No'}`);
        console.log(`[${getTimestamp()}] Errors encountered: ${this.stats.errors.length}`);

        if (this.stats.errors.length > 0) {
            console.log(`[${getTimestamp()}] Error summary:`);
            this.stats.errors.forEach((error, index) => {
                console.log(`[${getTimestamp()}]   ${index + 1}. ${error.operation || error.category}: ${error.error}`);
            });
        }

        // Quality distribution
        const qualityDistribution = this.calculateQualityDistribution(finalBusinesses);
        console.log(`[${getTimestamp()}] Data quality distribution:`, qualityDistribution);

        // Performance metrics
        const scraperStats = this.scraper ? this.scraper.getStats() : {};
        const sheetsStats = this.sheetsManager ? this.sheetsManager.getStats() : {};

        console.log(`[${getTimestamp()}] Scraper performance:`, scraperStats);
        if (this.sheetsManager) {
            console.log(`[${getTimestamp()}] Google Sheets performance:`, sheetsStats);
        }

        const finalMemory = getMemoryUsage();
        console.log(`[${getTimestamp()}] Final memory usage:`, finalMemory);

        console.log(`[${getTimestamp()}] ====== Dubai SME Scraper Completed ======`);
    }

    /**
     * Calculate data quality distribution
     * @param {Array} businesses - Business data
     * @returns {Object} - Quality distribution statistics
     */
    calculateQualityDistribution(businesses) {
        const distribution = {
            excellent: 0, // 80-100
            good: 0, // 60-79
            fair: 0, // 40-59
            poor: 0 // 0-39
        };

        businesses.forEach((business) => {
            const score = business.dataQualityScore || 0;
            if (score >= 80) distribution.excellent++;
            else if (score >= 60) distribution.good++;
            else if (score >= 40) distribution.fair++;
            else distribution.poor++;
        });

        return {
            ...distribution,
            percentages: {
                excellent: Math.round(distribution.excellent / businesses.length * 100),
                good: Math.round(distribution.good / businesses.length * 100),
                fair: Math.round(distribution.fair / businesses.length * 100),
                poor: Math.round(distribution.poor / businesses.length * 100)
            }
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log(`[${getTimestamp()}] Cleaning up resources...`);

        try {
            if (this.scraper) {
                await this.scraper.close();
            }
        } catch (error) {
            console.warn(`[${getTimestamp()}] Error closing scraper:`, error.message);
        }

        const finalMemory = getMemoryUsage();
        console.log(`[${getTimestamp()}] Cleanup completed. Final memory:`, finalMemory);
    }
}

/**
 * Main entry point for the Apify actor
 */
async function main() {
    const actor = new DubaiSMEActor();

    try {
        await actor.run();
        process.exit(0);
    } catch (error) {
        console.error(`[${getTimestamp()}] Actor failed:`, error);
        await Apify.setValue('ERROR_LOG', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(`[${getTimestamp()}] Uncaught exception:`, error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${getTimestamp()}] Unhandled rejection at:`, promise, 'reason:', reason);
    process.exit(1);
});

// Run the actor if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = DubaiSMEActor;
