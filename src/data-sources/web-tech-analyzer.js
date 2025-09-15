/**
 * Website Technology Analyzer
 * Analyzes websites for technology stack, security measures, and digital maturity
 */

const BaseScraper = require('./base-scraper');

class WebTechAnalyzer extends BaseScraper {
    constructor(options = {}) {
        super(options);
        this.technologyPatterns = this.initializeTechnologyPatterns();
        this.securityIndicators = this.initializeSecurityIndicators();
    }

    /**
     * Initialize technology detection patterns
     */
    initializeTechnologyPatterns() {
        return {
            // CMS/Frameworks
            wordpress: {
                patterns: ['/wp-content/', '/wp-includes/', 'wp-json', 'WordPress'],
                score: 30 // Lower score for outdated tech
            },
            react: {
                patterns: ['react', '__REACT_DEVTOOLS', 'ReactDOM'],
                score: 80
            },
            angular: {
                patterns: ['ng-', 'angular', '@angular'],
                score: 80
            },
            vue: {
                patterns: ['vue.js', '__VUE__', 'v-'],
                score: 80
            },
            shopify: {
                patterns: ['shopifycdn.com', 'myshopify.com', 'Shopify'],
                score: 70
            },
            magento: {
                patterns: ['/skin/frontend/', 'Mage.', 'magento'],
                score: 50
            },
            
            // E-commerce
            woocommerce: {
                patterns: ['/wp-content/plugins/woocommerce/', 'wc-', 'WooCommerce'],
                score: 40
            },
            
            // Analytics/Tracking
            googleAnalytics: {
                patterns: ['google-analytics.com', 'gtag(', 'ga('],
                score: 60
            },
            facebookPixel: {
                patterns: ['connect.facebook.net', 'fbq('],
                score: 60
            },
            
            // Security/Performance
            cloudflare: {
                patterns: ['cloudflare', '__cfduid', 'cf-ray'],
                score: 70
            },
            ssl: {
                patterns: ['https://'],
                score: 60
            }
        };
    }

    /**
     * Initialize security indicators
     */
    initializeSecurityIndicators() {
        return {
            ssl: { weight: 20, description: 'SSL Certificate' },
            csp: { weight: 15, description: 'Content Security Policy' },
            hsts: { weight: 15, description: 'HTTP Strict Transport Security' },
            xframe: { weight: 10, description: 'X-Frame-Options' },
            xss: { weight: 10, description: 'XSS Protection' },
            modernFramework: { weight: 20, description: 'Modern Framework' },
            cdn: { weight: 10, description: 'CDN Usage' }
        };
    }

    /**
     * Analyze website technology and security
     */
    async analyzeWebsite(url) {
        if (!url || !url.startsWith('http')) {
            return null;
        }

        console.log(`[WebTechAnalyzer] Analyzing: ${url}`);

        try {
            const analysis = {
                url: url,
                technologies: {},
                security: {},
                performance: {},
                digitalMaturity: {},
                analyzedAt: new Date().toISOString()
            };

            // Navigate to website
            const response = await this.page.goto(url, { 
                waitUntil: 'networkidle',
                timeout: 15000 
            });

            if (!response || !response.ok()) {
                throw new Error(`Failed to load website: ${response?.status()}`);
            }

            // Analyze technologies
            analysis.technologies = await this.detectTechnologies();
            
            // Analyze security
            analysis.security = await this.analyzeSecurity(response);
            
            // Analyze performance
            analysis.performance = await this.analyzePerformance();
            
            // Calculate digital maturity score
            analysis.digitalMaturity = this.calculateDigitalMaturity(analysis);
            
            return analysis;

        } catch (error) {
            console.error(`[WebTechAnalyzer] Error analyzing ${url}: ${error.message}`);
            return {
                url: url,
                error: error.message,
                digitalMaturity: { score: 0, level: 'Unknown' },
                analyzedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Detect technologies used on the website
     */
    async detectTechnologies() {
        const technologies = {};
        
        try {
            // Get page source
            const pageContent = await this.page.content();
            
            // Analyze JavaScript globals
            const jsGlobals = await this.page.evaluate(() => {
                return Object.keys(window).filter(key => 
                    key.includes('React') || 
                    key.includes('Angular') || 
                    key.includes('Vue') ||
                    key.includes('jQuery') ||
                    key.includes('WordPress')
                );
            });

            // Check each technology pattern
            for (const [techName, techData] of Object.entries(this.technologyPatterns)) {
                let detected = false;
                
                // Check in page content
                for (const pattern of techData.patterns) {
                    if (pageContent.includes(pattern)) {
                        detected = true;
                        break;
                    }
                }
                
                // Check in JS globals
                if (!detected && jsGlobals.some(global => 
                    global.toLowerCase().includes(techName.toLowerCase()))) {
                    detected = true;
                }
                
                if (detected) {
                    technologies[techName] = {
                        detected: true,
                        score: techData.score,
                        category: this.getTechnologyCategory(techName)
                    };
                }
            }

            // Detect additional meta information
            const metaInfo = await this.extractMetaInformation();
            technologies.meta = metaInfo;

            return technologies;

        } catch (error) {
            console.error('[WebTechAnalyzer] Error detecting technologies:', error.message);
            return {};
        }
    }

    /**
     * Extract meta information from website
     */
    async extractMetaInformation() {
        try {
            const metaInfo = {};
            
            // Get meta tags
            const metaTags = await this.page.$$eval('meta', metas => 
                metas.map(meta => ({
                    name: meta.getAttribute('name'),
                    property: meta.getAttribute('property'),
                    content: meta.getAttribute('content')
                }))
            );

            // Extract relevant meta information
            metaTags.forEach(meta => {
                if (meta.name === 'generator' && meta.content) {
                    metaInfo.generator = meta.content;
                }
                if (meta.name === 'description' && meta.content) {
                    metaInfo.description = meta.content.substring(0, 200);
                }
                if (meta.property === 'og:title' && meta.content) {
                    metaInfo.ogTitle = meta.content;
                }
            });

            // Check for common CMS indicators in HTML
            const htmlContent = await this.page.content();
            if (htmlContent.includes('wp-content')) {
                metaInfo.cms = 'WordPress';
            } else if (htmlContent.includes('drupal')) {
                metaInfo.cms = 'Drupal';
            } else if (htmlContent.includes('joomla')) {
                metaInfo.cms = 'Joomla';
            }

            return metaInfo;

        } catch (error) {
            return {};
        }
    }

    /**
     * Analyze security measures
     */
    async analyzeSecurity(response) {
        const security = {
            score: 0,
            measures: {},
            recommendations: []
        };

        try {
            const headers = response.headers();
            
            // Check SSL
            if (response.url().startsWith('https://')) {
                security.measures.ssl = true;
                security.score += this.securityIndicators.ssl.weight;
            } else {
                security.recommendations.push('Implement SSL certificate');
            }

            // Check security headers
            if (headers['content-security-policy']) {
                security.measures.csp = true;
                security.score += this.securityIndicators.csp.weight;
            } else {
                security.recommendations.push('Add Content Security Policy');
            }

            if (headers['strict-transport-security']) {
                security.measures.hsts = true;
                security.score += this.securityIndicators.hsts.weight;
            } else {
                security.recommendations.push('Enable HSTS');
            }

            if (headers['x-frame-options']) {
                security.measures.xframe = true;
                security.score += this.securityIndicators.xframe.weight;
            } else {
                security.recommendations.push('Set X-Frame-Options header');
            }

            if (headers['x-xss-protection']) {
                security.measures.xss = true;
                security.score += this.securityIndicators.xss.weight;
            } else {
                security.recommendations.push('Enable XSS Protection');
            }

            // Check for CDN usage
            const cdnHeaders = ['cf-ray', 'x-served-by', 'x-cache'];
            if (cdnHeaders.some(header => headers[header])) {
                security.measures.cdn = true;
                security.score += this.securityIndicators.cdn.weight;
            }

            security.level = this.getSecurityLevel(security.score);
            return security;

        } catch (error) {
            console.error('[WebTechAnalyzer] Error analyzing security:', error.message);
            return security;
        }
    }

    /**
     * Analyze website performance indicators
     */
    async analyzePerformance() {
        try {
            const performance = {};
            
            // Measure page load metrics
            const metrics = await this.page.evaluate(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                return {
                    loadTime: perf ? perf.loadEventEnd - perf.fetchStart : null,
                    domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.fetchStart : null,
                    firstContentfulPaint: null // Would need more complex implementation
                };
            });

            performance.loadTime = metrics.loadTime;
            performance.domContentLoaded = metrics.domContentLoaded;

            // Count resources
            const resourceCounts = await this.page.evaluate(() => {
                const resources = performance.getEntriesByType('resource');
                return {
                    total: resources.length,
                    images: resources.filter(r => r.initiatorType === 'img').length,
                    scripts: resources.filter(r => r.initiatorType === 'script').length,
                    stylesheets: resources.filter(r => r.initiatorType === 'link').length
                };
            });

            performance.resources = resourceCounts;
            performance.score = this.calculatePerformanceScore(performance);

            return performance;

        } catch (error) {
            console.error('[WebTechAnalyzer] Error analyzing performance:', error.message);
            return { score: 0 };
        }
    }

    /**
     * Calculate overall digital maturity score
     */
    calculateDigitalMaturity(analysis) {
        let totalScore = 0;
        let maxScore = 100;

        // Technology score (40% weight)
        const techScore = this.calculateTechnologyScore(analysis.technologies);
        totalScore += techScore * 0.4;

        // Security score (35% weight)
        const securityScore = analysis.security.score || 0;
        totalScore += securityScore * 0.35;

        // Performance score (25% weight)
        const performanceScore = analysis.performance.score || 0;
        totalScore += performanceScore * 0.25;

        const finalScore = Math.round(totalScore);

        return {
            score: finalScore,
            level: this.getMaturityLevel(finalScore),
            breakdown: {
                technology: Math.round(techScore),
                security: securityScore,
                performance: performanceScore
            }
        };
    }

    /**
     * Calculate technology score
     */
    calculateTechnologyScore(technologies) {
        if (!technologies || Object.keys(technologies).length === 0) {
            return 20; // Basic score for having a website
        }

        let score = 0;
        let detectedTechs = 0;

        for (const [techName, techData] of Object.entries(technologies)) {
            if (techData.detected && techData.score) {
                score += techData.score;
                detectedTechs++;
            }
        }

        // Bonus for modern tech stack diversity
        if (detectedTechs >= 3) score += 10;
        if (detectedTechs >= 5) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Calculate performance score
     */
    calculatePerformanceScore(performance) {
        let score = 50; // Base score

        if (performance.loadTime) {
            if (performance.loadTime < 2000) score += 30;
            else if (performance.loadTime < 4000) score += 20;
            else if (performance.loadTime < 6000) score += 10;
            else score -= 10;
        }

        if (performance.resources) {
            if (performance.resources.total < 50) score += 10;
            else if (performance.resources.total > 100) score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get technology category
     */
    getTechnologyCategory(techName) {
        const categories = {
            wordpress: 'CMS',
            react: 'Framework',
            angular: 'Framework',
            vue: 'Framework',
            shopify: 'E-commerce',
            magento: 'E-commerce',
            woocommerce: 'E-commerce',
            googleAnalytics: 'Analytics',
            facebookPixel: 'Marketing',
            cloudflare: 'Infrastructure',
            ssl: 'Security'
        };
        return categories[techName] || 'Other';
    }

    /**
     * Get security level based on score
     */
    getSecurityLevel(score) {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        if (score >= 40) return 'Basic';
        return 'Low';
    }

    /**
     * Get digital maturity level
     */
    getMaturityLevel(score) {
        if (score >= 85) return 'Advanced';
        if (score >= 70) return 'Mature';
        if (score >= 55) return 'Developing';
        if (score >= 40) return 'Basic';
        return 'Outdated';
    }
}

module.exports = WebTechAnalyzer;