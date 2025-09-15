/**
 * Base Scraper Class
 * Abstract base class for all data source scrapers
 */

const { chromium } = require('playwright');

class BaseScraper {
    constructor(options = {}) {
        this.options = {
            headless: true,
            timeout: 30000,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            retryAttempts: 3,
            retryDelay: 2000,
            ...options
        };
        this.browser = null;
        this.context = null;
        this.page = null;
        this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            startTime: null,
            endTime: null
        };
    }

    /**
     * Initialize browser and context
     */
    async initialize() {
        try {
            this.browser = await chromium.launch({
                headless: this.options.headless,
                args: ['--no-sandbox', '--disable-dev-shm-usage']
            });

            this.context = await this.browser.newContext({
                userAgent: this.options.userAgent,
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US'
            });

            this.page = await this.context.newPage();
            this.page.setDefaultTimeout(this.options.timeout);
            
            this.stats.startTime = Date.now();
            console.log(`[${this.constructor.name}] Initialized successfully`);
            
        } catch (error) {
            throw new Error(`Failed to initialize ${this.constructor.name}: ${error.message}`);
        }
    }

    /**
     * Abstract method - must be implemented by subclasses
     */
    async search(query, location = '') {
        throw new Error('search() method must be implemented by subclass');
    }

    /**
     * Abstract method - must be implemented by subclasses  
     */
    async extractBusinessData(element) {
        throw new Error('extractBusinessData() method must be implemented by subclass');
    }

    /**
     * Retry mechanism for failed operations
     */
    async retry(operation, context = '') {
        let lastError;
        
        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt < this.options.retryAttempts) {
                    console.log(`[${this.constructor.name}] ${context} - Attempt ${attempt} failed, retrying in ${this.options.retryDelay}ms...`);
                    await this.delay(this.options.retryDelay);
                } else {
                    console.log(`[${this.constructor.name}] ${context} - All ${this.options.retryAttempts} attempts failed`);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Safe click with multiple strategies
     */
    async safeClick(selector, options = {}) {
        const element = await this.page.waitForSelector(selector, { timeout: 5000 });
        
        try {
            await element.click(options);
        } catch (error) {
            // Try force click
            await element.click({ force: true, ...options });
        }
    }

    /**
     * Safe text extraction
     */
    async safeText(selector, defaultValue = null) {
        try {
            const element = await this.page.waitForSelector(selector, { timeout: 3000 });
            return (await element.textContent()).trim();
        } catch (error) {
            return defaultValue;
        }
    }

    /**
     * Safe attribute extraction
     */
    async safeAttribute(selector, attribute, defaultValue = null) {
        try {
            const element = await this.page.waitForSelector(selector, { timeout: 3000 });
            return await element.getAttribute(attribute);
        } catch (error) {
            return defaultValue;
        }
    }

    /**
     * Delay utility
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Human-like random delay
     */
    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.delay(delay);
    }

    /**
     * Update statistics
     */
    updateStats(success = true) {
        this.stats.totalProcessed++;
        if (success) {
            this.stats.successful++;
        } else {
            this.stats.failed++;
        }
    }

    /**
     * Get final statistics
     */
    getStats() {
        this.stats.endTime = Date.now();
        this.stats.runtime = this.stats.endTime - this.stats.startTime;
        this.stats.successRate = this.stats.totalProcessed > 0 
            ? Math.round((this.stats.successful / this.stats.totalProcessed) * 100) 
            : 0;
        
        return this.stats;
    }

    /**
     * Clean up resources
     */
    async close() {
        try {
            if (this.page) await this.page.close();
            if (this.context) await this.context.close();
            if (this.browser) await this.browser.close();
            
            const stats = this.getStats();
            console.log(`[${this.constructor.name}] Closed. Stats:`, stats);
        } catch (error) {
            console.error(`[${this.constructor.name}] Error closing:`, error.message);
        }
    }
}

module.exports = BaseScraper;