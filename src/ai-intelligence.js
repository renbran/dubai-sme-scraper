/**
 * OpenAI Integration Module for Dubai SME Scraper
 * Provides AI-powered business intelligence, classification, and optimization
 */

const OpenAI = require('openai');

class AIBusinessIntelligence {
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        this.model = options.model || 'gpt-4o-mini'; // Cost-effective model
        this.enabled = options.enabled !== false && !!this.apiKey;
        
        if (this.enabled) {
            this.openai = new OpenAI({
                apiKey: this.apiKey
            });
        }
        
        console.log(`🧠 AI Intelligence: ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Generate optimized search queries for specific business types and locations
     * @param {Object} criteria - Search criteria
     * @returns {Array} - Array of optimized search queries
     */
    async generateSearchQueries(criteria) {
        if (!this.enabled) return this.fallbackQueries(criteria);

        try {
            const prompt = `Generate 8-10 highly targeted Google Maps search queries for finding ${criteria.businessType} in ${criteria.location}.

Business Type: ${criteria.businessType}
Location: ${criteria.location}
Target: Small to Medium Enterprises (SMEs)
Focus: Real businesses with physical presence, not individual freelancers

Requirements:
- Include specific industry terms and variations
- Mix general and specific location areas
- Include Arabic and English business names
- Focus on established companies with offices
- Avoid queries that return individual professionals

Format: Return only the search queries, one per line, no numbering or bullets.

Example criteria - Real Estate Companies in Dubai:
real estate companies in Dubai Marina
property developers in Business Bay Dubai
real estate agencies in Downtown Dubai
عقارات شركات في دبي
property investment companies Dubai
real estate brokers in JLT Dubai
املاك شركات في مدينة دبي
commercial real estate Dubai
real estate consultancy firms Dubai
property management companies Dubai`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.7
            });

            const queries = response.choices[0].message.content
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.trim());

            console.log(`🎯 AI generated ${queries.length} optimized search queries`);
            return queries;

        } catch (error) {
            console.warn('⚠️ AI query generation failed, using fallback:', error.message);
            return this.fallbackQueries(criteria);
        }
    }

    /**
     * Classify business as SME or Enterprise and extract business intelligence
     * @param {Object} businessData - Raw business data from scraper
     * @returns {Object} - Enhanced business data with AI classification
     */
    async classifyBusiness(businessData) {
        if (!this.enabled) return this.fallbackClassification(businessData);

        try {
            const prompt = `Analyze this business and provide classification and insights:

Business Name: ${businessData.businessName}
Category: ${businessData.category || 'Unknown'}
Description: ${businessData.description || 'No description'}
Address: ${businessData.address || 'No address'}
Website: ${businessData.website || 'No website'}
Reviews: ${businessData.reviewCount || 0} reviews, ${businessData.rating || 0} rating

Classify and analyze:
1. Business Size: SME (Small/Medium Enterprise) or ENTERPRISE (Large Corporation)
2. Industry Category: Main business industry
3. Business Type: Service/Product/Trading/Manufacturing
4. Target Market: B2B/B2C/Both
5. Company Stage: Startup/Established/Mature
6. Lead Quality Score: 1-100 (higher = better lead)
7. Key Insights: Brief analysis of business potential

Respond in JSON format:
{
  "businessSize": "SME|ENTERPRISE",
  "industryCategory": "string",
  "businessType": "string",
  "targetMarket": "string",
  "companyStage": "string",
  "leadQualityScore": number,
  "keyInsights": "string",
  "aiConfidence": number
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 400,
                temperature: 0.3
            });

            let responseText = response.choices[0].message.content.trim();
            
            // Clean up the response to extract just the JSON
            if (responseText.includes('```json')) {
                responseText = responseText.split('```json')[1].split('```')[0].trim();
            } else if (responseText.includes('```')) {
                responseText = responseText.split('```')[1].split('```')[0].trim();
            }
            
            const classification = JSON.parse(responseText);
            
            console.log(`🔍 AI classified: ${businessData.businessName} as ${classification.businessSize} (Score: ${classification.leadQualityScore})`);
            
            return {
                ...businessData,
                aiClassification: classification,
                enhancedAt: new Date().toISOString()
            };

        } catch (error) {
            console.warn(`⚠️ AI classification failed for ${businessData.businessName}:`, error.message);
            return this.fallbackClassification(businessData);
        }
    }

    /**
     * Enhance business data with AI-extracted insights
     * @param {Object} businessData - Business data to enhance
     * @returns {Object} - Enhanced business data
     */
    async enhanceBusinessData(businessData) {
        if (!this.enabled) return businessData;

        try {
            const contentToAnalyze = [
                businessData.description,
                businessData.businessName,
                businessData.category,
                businessData.website
            ].filter(Boolean).join(' ');

            if (!contentToAnalyze.trim()) return businessData;

            const prompt = `Extract additional business insights from this information:

Content: "${contentToAnalyze}"
Address: ${businessData.address}
Phone: ${businessData.phone}

Extract and format as JSON:
{
  "estimatedEmployees": "1-10|11-50|51-200|200+",
  "servicesOffered": ["service1", "service2"],
  "keyPersonnel": ["name1", "name2"],
  "businessModel": "B2B|B2C|Both",
  "marketFocus": "Local|Regional|International",
  "extractedEmails": ["email1", "email2"],
  "socialPresence": "High|Medium|Low",
  "digitalMaturity": "Advanced|Moderate|Basic"
}`;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.3
            });

            let responseText = response.choices[0].message.content.trim();
            
            // Clean up the response to extract just the JSON
            if (responseText.includes('```json')) {
                responseText = responseText.split('```json')[1].split('```')[0].trim();
            } else if (responseText.includes('```')) {
                responseText = responseText.split('```')[1].split('```')[0].trim();
            }

            const enhancements = JSON.parse(responseText);
            
            return {
                ...businessData,
                aiEnhancements: enhancements,
                enhancedAt: new Date().toISOString()
            };

        } catch (error) {
            console.warn(`⚠️ AI enhancement failed for ${businessData.businessName}:`, error.message);
            return businessData;
        }
    }

    /**
     * Score and rank leads based on multiple AI factors
     * @param {Array} businesses - Array of business data
     * @returns {Array} - Sorted array with AI lead scores
     */
    async scoreAndRankLeads(businesses) {
        if (!this.enabled || !businesses.length) return businesses;

        console.log(`🎯 AI scoring ${businesses.length} leads...`);

        const scoredBusinesses = await Promise.all(
            businesses.map(async (business) => {
                try {
                    const classified = await this.classifyBusiness(business);
                    const enhanced = await this.enhanceBusinessData(classified);
                    
                    // Calculate composite lead score
                    const leadScore = this.calculateCompositeScore(enhanced);
                    
                    return {
                        ...enhanced,
                        compositeLeadScore: leadScore
                    };
                } catch (error) {
                    console.warn(`⚠️ Failed to score lead ${business.businessName}:`, error.message);
                    return { ...business, compositeLeadScore: 50 }; // Default middle score
                }
            })
        );

        // Sort by composite lead score (highest first)
        const rankedLeads = scoredBusinesses.sort((a, b) => 
            (b.compositeLeadScore || 0) - (a.compositeLeadScore || 0)
        );

        console.log(`✅ AI ranking complete. Top lead: ${rankedLeads[0]?.businessName} (Score: ${rankedLeads[0]?.compositeLeadScore})`);
        
        return rankedLeads;
    }

    /**
     * Calculate composite lead score from various factors
     * @param {Object} business - Enhanced business data
     * @returns {number} - Composite score 0-100
     */
    calculateCompositeScore(business) {
        let score = 50; // Base score

        // AI classification score (40% weight)
        if (business.aiClassification?.leadQualityScore) {
            score = business.aiClassification.leadQualityScore * 0.4 + score * 0.6;
        }

        // Data completeness (20% weight)
        const completeness = this.calculateDataCompleteness(business);
        score += completeness * 0.2;

        // Business size preference (20% weight) - SMEs preferred
        if (business.aiClassification?.businessSize === 'SME') {
            score += 20;
        }

        // Contact information availability (20% weight)
        const contactScore = this.calculateContactScore(business);
        score += contactScore * 0.2;

        return Math.round(Math.min(100, Math.max(0, score)));
    }

    /**
     * Calculate data completeness score
     */
    calculateDataCompleteness(business) {
        const fields = ['businessName', 'phone', 'email', 'website', 'address', 'category'];
        const filledFields = fields.filter(field => business[field]);
        return (filledFields.length / fields.length) * 100;
    }

    /**
     * Calculate contact information score
     */
    calculateContactScore(business) {
        let score = 0;
        if (business.phone) score += 30;
        if (business.email) score += 40;
        if (business.website) score += 20;
        if (business.socialMedia && Object.keys(business.socialMedia).length > 0) score += 10;
        return score;
    }

    /**
     * Fallback search queries when AI is disabled
     */
    fallbackQueries(criteria) {
        const baseQueries = [
            `${criteria.businessType} in ${criteria.location}`,
            `${criteria.businessType} companies ${criteria.location}`,
            `${criteria.businessType} services ${criteria.location}`,
            `${criteria.businessType} firms ${criteria.location}`
        ];
        
        console.log(`📝 Using fallback queries (${baseQueries.length})`);
        return baseQueries;
    }

    /**
     * Fallback classification when AI is disabled
     */
    fallbackClassification(businessData) {
        return {
            ...businessData,
            aiClassification: {
                businessSize: 'SME', // Default assumption
                industryCategory: businessData.category || 'Unknown',
                leadQualityScore: 60, // Default medium score
                aiConfidence: 0 // No AI used
            }
        };
    }

    /**
     * Check if AI features are available
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Get current AI configuration
     */
    getConfig() {
        return {
            enabled: this.enabled,
            model: this.model,
            hasApiKey: !!this.apiKey
        };
    }
}

module.exports = AIBusinessIntelligence;