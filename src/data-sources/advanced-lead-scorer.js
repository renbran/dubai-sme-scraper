/**
 * Advanced Lead Scoring System
 * Implements sophisticated AI-powered scoring based on multiple data sources
 */

class AdvancedLeadScorer {
    constructor(options = {}) {
        this.weights = {
            digitalMaturity: 0.30,
            businessSize: 0.25,
            dataCompleteness: 0.20,
            industryFit: 0.15,
            growthIndicators: 0.10
        };
        
        this.scoringCriteria = this.initializeScoringCriteria();
    }

    /**
     * Initialize scoring criteria based on user requirements
     */
    initializeScoringCriteria() {
        return {
            // High Priority Indicators (8-10 points)
            highPriority: {
                outdatedWebsite: {
                    description: 'Outdated website technology',
                    score: 10,
                    indicators: ['wordpress', 'old_framework', 'no_ssl'],
                    weight: 0.3
                },
                noSecurity: {
                    description: 'No visible cybersecurity measures',
                    score: 9,
                    indicators: ['no_ssl', 'no_security_headers', 'low_security_score'],
                    weight: 0.25
                },
                growthIndicators: {
                    description: 'Recent growth indicators',
                    score: 10,
                    indicators: ['recent_news', 'job_postings', 'expansion'],
                    weight: 0.2
                },
                itJobPostings: {
                    description: 'Job postings for IT roles',
                    score: 9,
                    indicators: ['it_jobs', 'tech_roles', 'digital_roles'],
                    weight: 0.25
                }
            },

            // Medium Priority Indicators (5-7 points)
            mediumPriority: {
                basicWebsite: {
                    description: 'Basic website but limited functionality',
                    score: 6,
                    indicators: ['basic_cms', 'limited_features', 'old_design'],
                    weight: 0.3
                },
                minimalSocial: {
                    description: 'Minimal social media presence',
                    score: 5,
                    indicators: ['few_social', 'inactive_social', 'low_engagement'],
                    weight: 0.2
                },
                transformingIndustry: {
                    description: 'Industry undergoing digital transformation',
                    score: 7,
                    indicators: ['traditional_industry', 'manual_processes'],
                    weight: 0.3
                },
                smeSize: {
                    description: 'SME business size',
                    score: 6,
                    indicators: ['employee_count_sme', 'revenue_sme'],
                    weight: 0.2
                }
            },

            // Low Priority Indicators (1-4 points)
            lowPriority: {
                modernWebsite: {
                    description: 'Modern website and tech stack',
                    score: 2,
                    indicators: ['modern_framework', 'good_performance', 'responsive'],
                    weight: 0.3
                },
                activeDigital: {
                    description: 'Active digital marketing presence',
                    score: 3,
                    indicators: ['social_active', 'seo_optimized', 'online_ads'],
                    weight: 0.25
                },
                recentIT: {
                    description: 'Recent IT investments mentioned',
                    score: 1,
                    indicators: ['recent_tech_news', 'new_systems', 'digital_initiatives'],
                    weight: 0.25
                },
                enterprise: {
                    description: 'Large enterprise',
                    score: 2,
                    indicators: ['large_employee_count', 'high_revenue'],
                    weight: 0.2
                }
            }
        };
    }

    /**
     * Score a lead based on comprehensive business data
     */
    async scoreLead(businessData) {
        try {
            const scoring = {
                totalScore: 0,
                priority: 'Low',
                breakdown: {},
                recommendations: [],
                reasoning: []
            };

            // 1. Digital Maturity Score (30% weight)
            const digitalScore = this.scoreDigitalMaturity(businessData);
            scoring.breakdown.digitalMaturity = digitalScore;
            scoring.totalScore += digitalScore.score * this.weights.digitalMaturity;

            // 2. Business Size Score (25% weight)
            const sizeScore = this.scoreBusinessSize(businessData);
            scoring.breakdown.businessSize = sizeScore;
            scoring.totalScore += sizeScore.score * this.weights.businessSize;

            // 3. Data Completeness Score (20% weight)
            const completenessScore = this.scoreDataCompleteness(businessData);
            scoring.breakdown.dataCompleteness = completenessScore;
            scoring.totalScore += completenessScore.score * this.weights.dataCompleteness;

            // 4. Industry Fit Score (15% weight)
            const industryScore = this.scoreIndustryFit(businessData);
            scoring.breakdown.industryFit = industryScore;
            scoring.totalScore += industryScore.score * this.weights.industryFit;

            // 5. Growth Indicators Score (10% weight)
            const growthScore = this.scoreGrowthIndicators(businessData);
            scoring.breakdown.growthIndicators = growthScore;
            scoring.totalScore += growthScore.score * this.weights.growthIndicators;

            // Round total score
            scoring.totalScore = Math.round(scoring.totalScore);

            // Determine priority level
            scoring.priority = this.determinePriority(scoring.totalScore);

            // Generate recommendations
            scoring.recommendations = this.generateRecommendations(businessData, scoring);

            // Generate reasoning
            scoring.reasoning = this.generateReasoning(scoring);

            return scoring;

        } catch (error) {
            console.error('[AdvancedLeadScorer] Error scoring lead:', error.message);
            return {
                totalScore: 0,
                priority: 'Unknown',
                breakdown: {},
                recommendations: ['Error in scoring process'],
                reasoning: ['Scoring failed due to data processing error']
            };
        }
    }

    /**
     * Score digital maturity based on website analysis
     */
    scoreDigitalMaturity(businessData) {
        const analysis = businessData.websiteAnalysis || {};
        const maturity = analysis.digitalMaturity || {};
        
        let score = 0;
        let insights = [];

        // Base score from digital maturity analysis
        if (maturity.score) {
            // Invert the score for lead scoring (lower tech = higher lead score)
            if (maturity.level === 'Outdated') {
                score = 95; // High lead score for outdated tech
                insights.push('Outdated technology stack presents high opportunity');
            } else if (maturity.level === 'Basic') {
                score = 80;
                insights.push('Basic digital presence with improvement potential');
            } else if (maturity.level === 'Developing') {
                score = 60;
                insights.push('Developing digital capabilities');
            } else if (maturity.level === 'Mature') {
                score = 30;
                insights.push('Mature digital presence - lower conversion potential');
            } else if (maturity.level === 'Advanced') {
                score = 15;
                insights.push('Advanced technology - likely satisfied with current setup');
            }
        } else {
            score = 50; // Default score when no website analysis available
            insights.push('No website analysis available');
        }

        // Security indicators (lack of security = higher lead score)
        const security = analysis.security || {};
        if (security.level === 'Low') {
            score += 15;
            insights.push('Low security measures - high cybersecurity need');
        } else if (security.level === 'Basic') {
            score += 10;
            insights.push('Basic security - room for improvement');
        }

        return {
            score: Math.min(100, score),
            insights: insights,
            level: maturity.level || 'Unknown'
        };
    }

    /**
     * Score business size preference (SMEs are higher priority)
     */
    scoreBusinessSize(businessData) {
        const classification = businessData.aiClassification || {};
        const websiteAnalysis = businessData.websiteAnalysis || {};
        
        let score = 50; // Default
        let insights = [];

        // AI classification
        if (classification.businessSize === 'SME') {
            score = 85;
            insights.push('SME business - ideal target size');
        } else if (classification.businessSize === 'Enterprise') {
            score = 25;
            insights.push('Enterprise business - may have established IT');
        } else if (classification.businessSize === 'Startup') {
            score = 70;
            insights.push('Startup - good growth potential');
        }

        // Employee count indicators from website analysis
        const enhancement = businessData.aiEnhancements || {};
        if (enhancement.estimatedEmployees) {
            if (enhancement.estimatedEmployees.includes('1-10')) {
                score = Math.max(score, 80);
                insights.push('Small team size - personal service opportunity');
            } else if (enhancement.estimatedEmployees.includes('11-50')) {
                score = Math.max(score, 90);
                insights.push('Perfect SME size for our services');
            } else if (enhancement.estimatedEmployees.includes('51-200')) {
                score = Math.max(score, 60);
                insights.push('Medium business - good potential');
            }
        }

        return {
            score: score,
            insights: insights,
            detectedSize: classification.businessSize || 'Unknown'
        };
    }

    /**
     * Score data completeness and contact accessibility
     */
    scoreDataCompleteness(businessData) {
        let score = 0;
        let insights = [];

        // Contact information availability
        if (businessData.email) {
            score += 25;
            insights.push('Email contact available');
        } else {
            insights.push('No email - need to find contact info');
        }

        if (businessData.phone) {
            score += 20;
            insights.push('Phone contact available');
        }

        if (businessData.website) {
            score += 20;
            insights.push('Website available for analysis');
        }

        // Social media presence
        const socialMedia = businessData.socialMedia || {};
        const socialCount = Object.keys(socialMedia).length;
        if (socialCount > 0) {
            score += Math.min(socialCount * 5, 15);
            insights.push(`${socialCount} social media channels found`);
        }

        // Address and location
        if (businessData.address) {
            score += 10;
        }

        // Business hours
        if (businessData.businessHours) {
            score += 10;
        }

        return {
            score: Math.min(100, score),
            insights: insights,
            completeness: Math.round(score)
        };
    }

    /**
     * Score industry fit for cybersecurity services
     */
    scoreIndustryFit(businessData) {
        const classification = businessData.aiClassification || {};
        const category = businessData.category || '';
        
        let score = 50; // Default
        let insights = [];

        // High-risk industries that need cybersecurity
        const highRiskIndustries = [
            'finance', 'healthcare', 'legal', 'accounting', 'real estate',
            'consulting', 'technology', 'e-commerce', 'retail'
        ];

        // Medium-risk industries
        const mediumRiskIndustries = [
            'manufacturing', 'construction', 'education', 'hospitality',
            'media', 'transportation'
        ];

        const industryCategory = classification.industryCategory || '';
        const businessCategory = category.toLowerCase();

        // Check for high-risk industries
        if (highRiskIndustries.some(industry => 
            industryCategory.toLowerCase().includes(industry) ||
            businessCategory.includes(industry))) {
            score = 90;
            insights.push('High-risk industry - strong cybersecurity need');
        } else if (mediumRiskIndustries.some(industry => 
            industryCategory.toLowerCase().includes(industry) ||
            businessCategory.includes(industry))) {
            score = 70;
            insights.push('Medium-risk industry - moderate cybersecurity need');
        } else {
            score = 40;
            insights.push('General industry - basic cybersecurity need');
        }

        // Business type considerations
        if (classification.targetMarket === 'B2B') {
            score += 10;
            insights.push('B2B business - higher compliance requirements');
        }

        return {
            score: Math.min(100, score),
            insights: insights,
            industry: industryCategory || 'Unknown'
        };
    }

    /**
     * Score growth indicators
     */
    scoreGrowthIndicators(businessData) {
        let score = 30; // Base score
        let insights = [];

        // Website recency and updates
        const websiteAnalysis = businessData.websiteAnalysis || {};
        if (websiteAnalysis.performance && websiteAnalysis.performance.score > 70) {
            score += 20;
            insights.push('Good website performance - active maintenance');
        }

        // Social media activity
        const socialMedia = businessData.socialMedia || {};
        if (Object.keys(socialMedia).length >= 3) {
            score += 15;
            insights.push('Active social media presence');
        }

        // Business hours availability
        if (businessData.businessHours) {
            score += 10;
            insights.push('Clear business hours - professional operation');
        }

        // High rating indicates growing business
        if (businessData.rating && businessData.rating >= 4.5) {
            score += 15;
            insights.push('High customer rating - growing reputation');
        }

        // Review count indicates activity
        if (businessData.reviewCount && businessData.reviewCount > 50) {
            score += 10;
            insights.push('High review count - active customer base');
        }

        return {
            score: Math.min(100, score),
            insights: insights
        };
    }

    /**
     * Determine priority level based on total score
     */
    determinePriority(totalScore) {
        if (totalScore >= 80) return 'High';
        if (totalScore >= 65) return 'Medium-High';
        if (totalScore >= 50) return 'Medium';
        if (totalScore >= 35) return 'Medium-Low';
        return 'Low';
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(businessData, scoring) {
        const recommendations = [];
        const digitalScore = scoring.breakdown.digitalMaturity?.score || 0;
        const completenessScore = scoring.breakdown.dataCompleteness?.score || 0;

        if (digitalScore >= 70) {
            recommendations.push('High priority: Outdated technology stack - immediate cybersecurity assessment recommended');
            recommendations.push('Focus on security consultation and modernization services');
        }

        if (completenessScore < 60) {
            recommendations.push('Research additional contact information before outreach');
            recommendations.push('Use LinkedIn or company website to find decision makers');
        }

        if (!businessData.email) {
            recommendations.push('Priority: Find email contact through website or social media');
        }

        if (scoring.breakdown.industryFit?.score >= 80) {
            recommendations.push('Industry-specific cybersecurity approach recommended');
        }

        if (scoring.totalScore >= 80) {
            recommendations.push('Schedule immediate consultation - high conversion potential');
        } else if (scoring.totalScore >= 50) {
            recommendations.push('Add to nurture campaign for future follow-up');
        }

        return recommendations;
    }

    /**
     * Generate scoring reasoning
     */
    generateReasoning(scoring) {
        const reasoning = [];
        
        reasoning.push(`Total Score: ${scoring.totalScore}/100 (${scoring.priority} Priority)`);
        
        Object.entries(scoring.breakdown).forEach(([category, data]) => {
            if (data.insights && data.insights.length > 0) {
                reasoning.push(`${category}: ${data.score}/100 - ${data.insights[0]}`);
            }
        });

        return reasoning;
    }

    /**
     * Batch score multiple leads
     */
    async scoreLeads(businessDataArray) {
        const scoredLeads = [];
        
        for (const businessData of businessDataArray) {
            const scoring = await this.scoreLead(businessData);
            scoredLeads.push({
                ...businessData,
                leadScoring: scoring
            });
        }

        // Sort by score (highest first)
        return scoredLeads.sort((a, b) => 
            (b.leadScoring?.totalScore || 0) - (a.leadScoring?.totalScore || 0)
        );
    }
}

module.exports = AdvancedLeadScorer;