/**
 * n8n Webhook Integration Module
 * Sends comprehensive lead intelligence data to n8n automation workflows
 */

const https = require('https');
const http = require('http');

class N8nWebhookIntegration {
    constructor(options = {}) {
        this.webhookUrl = options.webhookUrl || 'https://kpajoosus123.app.n8n.cloud/webhook-test/906ece75-9308-49fb-ab57-3db1375359d0';
        this.batchSize = options.batchSize || 10; // Send leads in batches
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 2000;
        
        this.stats = {
            totalSent: 0,
            successful: 0,
            failed: 0,
            batchesSent: 0
        };
    }

    /**
     * Send comprehensive intelligence data to n8n webhook
     */
    async sendIntelligenceData(intelligenceData, searchMetadata = {}) {
        console.log(`[N8nWebhook] Preparing to send ${intelligenceData.length} leads to n8n...`);
        
        try {
            // Prepare comprehensive payload
            const payload = this.prepareIntelligencePayload(intelligenceData, searchMetadata);
            
            // Send data
            const response = await this.sendWebhookData(payload);
            
            console.log(`[N8nWebhook] Successfully sent intelligence data`);
            console.log(`[N8nWebhook] Response status: ${response.status}`);
            
            this.stats.successful += intelligenceData.length;
            this.stats.totalSent += intelligenceData.length;
            this.stats.batchesSent += 1;
            
            return {
                success: true,
                response: response,
                leadsSent: intelligenceData.length
            };
            
        } catch (error) {
            console.error(`[N8nWebhook] Error sending intelligence data:`, error.message);
            this.stats.failed += intelligenceData.length;
            
            return {
                success: false,
                error: error.message,
                leadsSent: 0
            };
        }
    }

    /**
     * Send leads in batches to avoid overwhelming the webhook
     */
    async sendLeadsInBatches(leads, searchMetadata = {}) {
        console.log(`[N8nWebhook] Sending ${leads.length} leads in batches of ${this.batchSize}...`);
        
        const results = [];
        
        for (let i = 0; i < leads.length; i += this.batchSize) {
            const batch = leads.slice(i, i + this.batchSize);
            const batchNumber = Math.floor(i / this.batchSize) + 1;
            const totalBatches = Math.ceil(leads.length / this.batchSize);
            
            console.log(`[N8nWebhook] Sending batch ${batchNumber}/${totalBatches} (${batch.length} leads)...`);
            
            try {
                const batchMetadata = {
                    ...searchMetadata,
                    batch: {
                        number: batchNumber,
                        total: totalBatches,
                        size: batch.length
                    }
                };
                
                const result = await this.sendIntelligenceData(batch, batchMetadata);
                results.push(result);
                
                // Rate limiting between batches
                if (i + this.batchSize < leads.length) {
                    await this.delay(1000);
                }
                
            } catch (error) {
                console.error(`[N8nWebhook] Batch ${batchNumber} failed:`, error.message);
                results.push({
                    success: false,
                    error: error.message,
                    leadsSent: 0
                });
            }
        }
        
        const summary = this.summarizeBatchResults(results);
        console.log(`[N8nWebhook] Batch sending complete: ${summary.successful}/${summary.total} batches successful`);
        
        return summary;
    }

    /**
     * Prepare comprehensive intelligence payload for n8n
     */
    prepareIntelligencePayload(leads, searchMetadata) {
        const timestamp = new Date().toISOString();
        
        // Calculate aggregate statistics
        const statistics = this.calculateAggregateStatistics(leads);
        
        // Prepare lead data with clean structure
        const processedLeads = leads.map(lead => this.cleanLeadData(lead));
        
        return {
            // Metadata
            timestamp: timestamp,
            source: 'Dubai-SME-Intelligence-Platform',
            version: '2.0',
            
            // Search context
            searchMetadata: {
                query: searchMetadata.query || 'Unknown',
                location: searchMetadata.location || 'Dubai, UAE',
                timestamp: searchMetadata.timestamp || timestamp,
                ...searchMetadata
            },
            
            // Aggregate intelligence
            intelligence: {
                summary: statistics.summary,
                leadQuality: statistics.leadQuality,
                technologyInsights: statistics.technologyInsights,
                marketOpportunity: statistics.marketOpportunity,
                competitiveIntelligence: statistics.competitiveIntelligence
            },
            
            // Individual leads
            leads: processedLeads,
            
            // Processing stats
            processingStats: {
                totalLeads: leads.length,
                highPriorityCount: statistics.summary.highPriority,
                avgLeadScore: statistics.summary.avgLeadScore,
                dataCompleteness: statistics.summary.dataCompleteness
            }
        };
    }

    /**
     * Clean and structure lead data for n8n consumption
     */
    cleanLeadData(lead) {
        return {
            // Core business info
            businessInfo: {
                name: lead.businessName,
                category: lead.category,
                address: lead.address,
                area: lead.locationDetails?.area,
                emirate: lead.locationDetails?.emirate,
                coordinates: lead.coordinates
            },
            
            // Contact information
            contact: {
                phone: lead.phone,
                email: lead.email,
                website: lead.website,
                socialMedia: lead.socialMedia || {}
            },
            
            // Business metrics
            metrics: {
                rating: lead.rating,
                reviewCount: lead.reviewCount,
                dataQualityScore: lead.dataQualityScore,
                verificationStatus: lead.verificationStatus
            },
            
            // AI classification
            aiClassification: {
                businessSize: lead.aiClassification?.businessSize,
                industryCategory: lead.aiClassification?.industryCategory,
                targetMarket: lead.aiClassification?.targetMarket,
                companyStage: lead.aiClassification?.companyStage,
                keyInsights: lead.aiClassification?.keyInsights,
                estimatedEmployees: lead.aiEnhancements?.estimatedEmployees
            },
            
            // Lead scoring
            leadScoring: {
                totalScore: lead.leadScoring?.totalScore,
                priority: lead.leadScoring?.priority,
                recommendations: lead.leadScoring?.recommendations || [],
                reasoning: lead.leadScoring?.reasoning || []
            },
            
            // Technology analysis
            technologyAnalysis: {
                digitalMaturity: lead.websiteAnalysis?.digitalMaturity?.level,
                securityLevel: lead.websiteAnalysis?.security?.level,
                technologies: this.extractTechnologies(lead.websiteAnalysis?.technologies),
                performanceScore: lead.websiteAnalysis?.performance?.score
            },
            
            // Data sources
            dataSource: {
                primary: lead.dataSource || 'Google Maps',
                sources: lead.dataSources || [lead.dataSource || 'Google Maps'],
                confidence: lead.confidence,
                lastUpdated: lead.lastUpdated
            }
        };
    }

    /**
     * Extract technology information
     */
    extractTechnologies(technologies) {
        if (!technologies) return {};
        
        const detected = {};
        Object.entries(technologies).forEach(([tech, data]) => {
            if (data && data.detected) {
                detected[tech] = {
                    category: data.category,
                    score: data.score
                };
            }
        });
        
        return {
            detected: detected,
            cms: technologies.meta?.cms,
            generator: technologies.meta?.generator
        };
    }

    /**
     * Calculate aggregate statistics for intelligence summary
     */
    calculateAggregateStatistics(leads) {
        const stats = {
            summary: {
                totalLeads: leads.length,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0,
                avgLeadScore: 0,
                dataCompleteness: 0
            },
            leadQuality: {
                smeBusinesses: 0,
                withWebsites: 0,
                withPhones: 0,
                withEmails: 0,
                highRating: 0
            },
            technologyInsights: {
                outdatedTech: 0,
                modernTech: 0,
                lowSecurity: 0,
                highSecurity: 0,
                techDistribution: {}
            },
            marketOpportunity: {
                immediateOpportunities: 0,
                totalOpportunityScore: 0
            },
            competitiveIntelligence: {
                industryDistribution: {},
                locationDistribution: {},
                avgRating: 0
            }
        };

        let totalScore = 0;
        let totalDataQuality = 0;
        let totalRating = 0;
        let ratingCount = 0;

        leads.forEach(lead => {
            // Lead scoring summary
            const score = lead.leadScoring?.totalScore || 0;
            const priority = lead.leadScoring?.priority || 'Low';
            
            totalScore += score;
            
            if (priority === 'High') stats.summary.highPriority++;
            else if (priority.includes('Medium')) stats.summary.mediumPriority++;
            else stats.summary.lowPriority++;

            // Data quality
            totalDataQuality += lead.dataQualityScore || 0;

            // Lead quality metrics
            if (lead.aiClassification?.businessSize === 'SME') stats.leadQuality.smeBusinesses++;
            if (lead.website) stats.leadQuality.withWebsites++;
            if (lead.phone) stats.leadQuality.withPhones++;
            if (lead.email) stats.leadQuality.withEmails++;
            if (lead.rating && lead.rating >= 4.0) stats.leadQuality.highRating++;

            // Technology insights
            const digitalMaturity = lead.websiteAnalysis?.digitalMaturity?.level;
            if (digitalMaturity === 'Outdated' || digitalMaturity === 'Basic') {
                stats.technologyInsights.outdatedTech++;
            } else if (digitalMaturity === 'Mature' || digitalMaturity === 'Advanced') {
                stats.technologyInsights.modernTech++;
            }

            const securityLevel = lead.websiteAnalysis?.security?.level;
            if (securityLevel === 'Low' || securityLevel === 'Basic') {
                stats.technologyInsights.lowSecurity++;
            } else if (securityLevel === 'High') {
                stats.technologyInsights.highSecurity++;
            }

            // Market opportunity
            if (score >= 80) stats.marketOpportunity.immediateOpportunities++;
            stats.marketOpportunity.totalOpportunityScore += score;

            // Competitive intelligence
            const industry = lead.aiClassification?.industryCategory || 'Unknown';
            const area = lead.locationDetails?.area || 'Unknown';
            
            stats.competitiveIntelligence.industryDistribution[industry] = 
                (stats.competitiveIntelligence.industryDistribution[industry] || 0) + 1;
            
            stats.competitiveIntelligence.locationDistribution[area] = 
                (stats.competitiveIntelligence.locationDistribution[area] || 0) + 1;

            if (lead.rating) {
                totalRating += lead.rating;
                ratingCount++;
            }
        });

        // Calculate averages
        stats.summary.avgLeadScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;
        stats.summary.dataCompleteness = leads.length > 0 ? Math.round(totalDataQuality / leads.length) : 0;
        stats.competitiveIntelligence.avgRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;

        return stats;
    }

    /**
     * Send data to webhook with retry logic
     */
    async sendWebhookData(payload) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await this.makeHttpRequest(payload);
            } catch (error) {
                lastError = error;
                
                if (attempt < this.retryAttempts) {
                    console.log(`[N8nWebhook] Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Make HTTP request to webhook
     */
    makeHttpRequest(payload) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.webhookUrl);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const postData = JSON.stringify(payload);
            
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'Dubai-SME-Intelligence-Platform/2.0'
                }
            };

            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            status: res.statusCode,
                            statusMessage: res.statusMessage,
                            data: data,
                            headers: res.headers
                        });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.setTimeout(30000); // 30 second timeout
            req.write(postData);
            req.end();
        });
    }

    /**
     * Summarize batch results
     */
    summarizeBatchResults(results) {
        const summary = {
            total: results.length,
            successful: 0,
            failed: 0,
            totalLeadsSent: 0,
            errors: []
        };

        results.forEach(result => {
            if (result.success) {
                summary.successful++;
                summary.totalLeadsSent += result.leadsSent;
            } else {
                summary.failed++;
                summary.errors.push(result.error);
            }
        });

        return summary;
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get integration statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalSent > 0 
                ? Math.round((this.stats.successful / this.stats.totalSent) * 100)
                : 0
        };
    }
}

module.exports = N8nWebhookIntegration;