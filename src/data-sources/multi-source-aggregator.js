/**
 * Multi-Source Data Aggregator
 * Combines data from Google Maps, Yelp, website analysis, and other sources
 */

const GoogleMapsScraper = require('../scraper');
const YelpScraper = require('./yelp-scraper');
const WebTechAnalyzer = require('./web-tech-analyzer');
const AdvancedLeadScorer = require('./advanced-lead-scorer');
const AIBusinessIntelligence = require('../ai-intelligence');
const N8nWebhookIntegration = require('../integrations/n8n-webhook');

class MultiSourceDataAggregator {
    constructor(options = {}) {
        this.options = {
            enabledSources: {
                googleMaps: true,
                yelp: true,
                websiteAnalysis: true,
                aiIntelligence: true
            },
            dedupThreshold: 0.8, // Name similarity threshold for deduplication
            maxConcurrent: 3,
            ...options
        };
        
        this.scrapers = {};
        this.leadScorer = new AdvancedLeadScorer();
        this.stats = {
            sources: {},
            totalProcessed: 0,
            totalUnique: 0,
            duplicatesRemoved: 0
        };
    }

    /**
     * Initialize all enabled scrapers
     */
    async initialize() {
        console.log('[MultiSourceAggregator] Initializing data sources...');
        
        try {
            if (this.options.enabledSources.googleMaps) {
                this.scrapers.googleMaps = new GoogleMapsScraper({ headless: true });
                await this.scrapers.googleMaps.initialize();
                console.log('✅ Google Maps scraper initialized');
            }

            if (this.options.enabledSources.yelp) {
                this.scrapers.yelp = new YelpScraper({ headless: true });
                await this.scrapers.yelp.initialize();
                console.log('✅ Yelp scraper initialized');
            }

            if (this.options.enabledSources.websiteAnalysis) {
                this.scrapers.webAnalyzer = new WebTechAnalyzer({ headless: true });
                await this.scrapers.webAnalyzer.initialize();
                console.log('✅ Website analyzer initialized');
            }

            if (this.options.enabledSources.aiIntelligence) {
                this.ai = new AIBusinessIntelligence({
                    apiKey: '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',
                    enabled: true
                });
                console.log('✅ AI intelligence initialized');
            }

            console.log('[MultiSourceAggregator] All sources initialized successfully');

        } catch (error) {
            console.error('[MultiSourceAggregator] Initialization error:', error.message);
            throw error;
        }
    }

    /**
     * Comprehensive business search across all data sources
     */
    async searchBusinesses(query, location = 'Dubai, UAE', options = {}) {
        console.log(`[MultiSourceAggregator] Comprehensive search: "${query}" in ${location}`);
        
        const searchOptions = {
            maxResults: 20,
            enhanceWithWebsite: true,
            ...options
        };

        const allBusinesses = [];
        
        try {
            // 1. Google Maps Search (Primary source)
            if (this.scrapers.googleMaps) {
                console.log('\n🗺️  Searching Google Maps...');
                const gmapsResults = await this.scrapers.googleMaps.searchBusinesses(query);
                
                if (gmapsResults && gmapsResults.length > 0) {
                    const enhancedResults = gmapsResults.map(business => ({
                        ...business,
                        dataSource: 'Google Maps',
                        confidence: 0.9
                    }));
                    
                    allBusinesses.push(...enhancedResults);
                    this.stats.sources.googleMaps = gmapsResults.length;
                    console.log(`   ✅ Found ${gmapsResults.length} businesses`);
                }
            }

            // 2. Yelp Search (Secondary source)
            if (this.scrapers.yelp) {
                console.log('\n🌟 Searching Yelp...');
                try {
                    const yelpResults = await this.scrapers.yelp.search(query, location);
                    
                    if (yelpResults && yelpResults.length > 0) {
                        const enhancedResults = yelpResults.map(business => ({
                            ...business,
                            dataSource: 'Yelp',
                            confidence: 0.8
                        }));
                        
                        allBusinesses.push(...enhancedResults);
                        this.stats.sources.yelp = yelpResults.length;
                        console.log(`   ✅ Found ${yelpResults.length} businesses`);
                    }
                } catch (error) {
                    console.log(`   ⚠️  Yelp search failed: ${error.message}`);
                    this.stats.sources.yelp = 0;
                }
            }

            // 3. Deduplicate businesses
            console.log('\n🔄 Deduplicating results...');
            const uniqueBusinesses = this.deduplicateBusinesses(allBusinesses);
            this.stats.totalProcessed = allBusinesses.length;
            this.stats.totalUnique = uniqueBusinesses.length;
            this.stats.duplicatesRemoved = allBusinesses.length - uniqueBusinesses.length;
            
            console.log(`   📊 Total found: ${allBusinesses.length}`);
            console.log(`   ✨ Unique businesses: ${uniqueBusinesses.length}`);
            console.log(`   🗑️  Duplicates removed: ${this.stats.duplicatesRemoved}`);

            // 4. Enhance with website analysis
            if (searchOptions.enhanceWithWebsite && this.scrapers.webAnalyzer) {
                console.log('\n🌐 Analyzing websites...');
                await this.enhanceWithWebsiteAnalysis(uniqueBusinesses);
            }

            // 5. AI Enhancement
            if (this.ai) {
                console.log('\n🧠 AI Enhancement...');
                await this.enhanceWithAI(uniqueBusinesses);
            }

            // 6. Advanced Lead Scoring
            console.log('\n🎯 Scoring leads...');
            const scoredBusinesses = await this.leadScorer.scoreLeads(uniqueBusinesses);

            // 7. Final ranking and filtering
            const finalResults = this.finalizeResults(scoredBusinesses, searchOptions);

            console.log('\n🏆 MULTI-SOURCE SEARCH COMPLETE!');
            console.log('================================');
            console.log(`📊 Sources used: ${Object.keys(this.stats.sources).join(', ')}`);
            console.log(`🎯 Final results: ${finalResults.length}`);
            console.log(`⭐ High priority leads: ${finalResults.filter(b => b.leadScoring?.priority === 'High').length}`);

            return finalResults;

        } catch (error) {
            console.error('[MultiSourceAggregator] Search error:', error.message);
            throw error;
        }
    }

    /**
     * Deduplicate businesses based on name similarity and location
     */
    deduplicateBusinesses(businesses) {
        const unique = [];
        
        for (const business of businesses) {
            const isDuplicate = unique.some(existing => 
                this.areSimilarBusinesses(business, existing)
            );
            
            if (!isDuplicate) {
                unique.push(business);
            } else {
                // Merge data from duplicate with higher confidence
                const existingIndex = unique.findIndex(existing => 
                    this.areSimilarBusinesses(business, existing)
                );
                
                if (business.confidence > unique[existingIndex].confidence) {
                    unique[existingIndex] = this.mergeBusinessData(unique[existingIndex], business);
                } else {
                    unique[existingIndex] = this.mergeBusinessData(business, unique[existingIndex]);
                }
            }
        }
        
        return unique;
    }

    /**
     * Check if two businesses are similar (likely duplicates)
     */
    areSimilarBusinesses(business1, business2) {
        // Name similarity
        const nameSimilarity = this.calculateStringSimilarity(
            business1.businessName?.toLowerCase() || '',
            business2.businessName?.toLowerCase() || ''
        );
        
        if (nameSimilarity >= this.options.dedupThreshold) {
            return true;
        }

        // Address similarity (if available)
        if (business1.address && business2.address) {
            const addressSimilarity = this.calculateStringSimilarity(
                business1.address.toLowerCase(),
                business2.address.toLowerCase()
            );
            
            if (addressSimilarity >= 0.7 && nameSimilarity >= 0.6) {
                return true;
            }
        }

        // Phone number match
        if (business1.phone && business2.phone) {
            const phone1 = business1.phone.replace(/[^\d]/g, '');
            const phone2 = business2.phone.replace(/[^\d]/g, '');
            
            if (phone1 === phone2 && phone1.length >= 7) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate string similarity using Levenshtein distance
     */
    calculateStringSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;
        
        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Merge data from two business records
     */
    mergeBusinessData(primary, secondary) {
        const merged = { ...primary };
        
        // Fill in missing data from secondary source
        Object.keys(secondary).forEach(key => {
            if (!merged[key] || merged[key] === null || merged[key] === '') {
                merged[key] = secondary[key];
            }
        });

        // Combine data sources
        merged.dataSources = [
            ...(primary.dataSources || [primary.dataSource]),
            ...(secondary.dataSources || [secondary.dataSource])
        ].filter((source, index, arr) => arr.indexOf(source) === index);

        // Use higher confidence
        merged.confidence = Math.max(primary.confidence || 0, secondary.confidence || 0);

        return merged;
    }

    /**
     * Enhance businesses with website analysis
     */
    async enhanceWithWebsiteAnalysis(businesses) {
        const websiteBusinesses = businesses.filter(b => b.website);
        console.log(`   🔍 Analyzing ${websiteBusinesses.length} websites...`);
        
        let analyzed = 0;
        for (const business of websiteBusinesses) {
            try {
                const analysis = await this.scrapers.webAnalyzer.analyzeWebsite(business.website);
                business.websiteAnalysis = analysis;
                analyzed++;
                
                if (analyzed % 5 === 0) {
                    console.log(`   📊 Analyzed ${analyzed}/${websiteBusinesses.length} websites...`);
                }
                
                // Rate limiting
                await this.delay(1000);
                
            } catch (error) {
                console.log(`   ⚠️  Website analysis failed for ${business.businessName}: ${error.message}`);
            }
        }
        
        console.log(`   ✅ Website analysis complete: ${analyzed}/${websiteBusinesses.length}`);
    }

    /**
     * Enhance businesses with AI intelligence
     */
    async enhanceWithAI(businesses) {
        console.log(`   🧠 AI analyzing ${businesses.length} businesses...`);
        
        let enhanced = 0;
        for (const business of businesses) {
            try {
                // AI Classification
                const classified = await this.ai.classifyBusiness(business);
                
                // AI Enhancement
                const aiEnhanced = await this.ai.enhanceBusinessData(classified);
                
                // Merge AI data
                Object.assign(business, aiEnhanced);
                enhanced++;
                
                if (enhanced % 3 === 0) {
                    console.log(`   🤖 AI enhanced ${enhanced}/${businesses.length} businesses...`);
                }
                
            } catch (error) {
                console.log(`   ⚠️  AI enhancement failed for ${business.businessName}: ${error.message}`);
            }
        }
        
        console.log(`   ✅ AI enhancement complete: ${enhanced}/${businesses.length}`);
    }

    /**
     * Finalize results with filtering and ranking
     */
    finalizeResults(scoredBusinesses, options) {
        let results = [...scoredBusinesses];
        
        // Filter by minimum score if specified
        if (options.minScore) {
            results = results.filter(b => 
                (b.leadScoring?.totalScore || 0) >= options.minScore
            );
        }

        // Filter by priority if specified
        if (options.minPriority) {
            const priorityOrder = ['Low', 'Medium-Low', 'Medium', 'Medium-High', 'High'];
            const minIndex = priorityOrder.indexOf(options.minPriority);
            
            results = results.filter(b => {
                const priority = b.leadScoring?.priority || 'Low';
                return priorityOrder.indexOf(priority) >= minIndex;
            });
        }

        // Limit results
        if (options.maxResults) {
            results = results.slice(0, options.maxResults);
        }

        return results;
    }

    /**
     * Delay utility
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get aggregation statistics
     */
    getStats() {
        return {
            ...this.stats,
            efficiency: this.stats.totalProcessed > 0 
                ? Math.round((this.stats.totalUnique / this.stats.totalProcessed) * 100)
                : 0
        };
    }

    /**
     * Close all scrapers
     */
    async close() {
        console.log('[MultiSourceAggregator] Closing all scrapers...');
        
        const closePromises = Object.values(this.scrapers).map(scraper => 
            scraper.close().catch(error => 
                console.error('Error closing scraper:', error.message)
            )
        );
        
        await Promise.all(closePromises);
        console.log('[MultiSourceAggregator] All scrapers closed');
    }
}

module.exports = MultiSourceDataAggregator;