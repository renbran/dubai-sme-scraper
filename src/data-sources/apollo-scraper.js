/**
 * Apollo.io Scraper
 * Scrapes C-level executives and decision-makers using Apollo.io API
 * Focuses on: CEO, CFO, CTO, COO, CMO, VP, Director, Founder, Managing Partner
 */

const axios = require('axios');
const { retryWithBackoff } = require('../utils');

class ApolloScraper {
    constructor(options = {}) {
        this.options = {
            apiKey: options.apiKey || process.env.APOLLO_API_KEY,
            baseUrl: 'https://api.apollo.io/v1',
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 2000,
            rateLimit: 60, // requests per minute
            ...options
        };

        this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            apiCalls: 0,
            creditsUsed: 0,
            startTime: null,
            endTime: null
        };

        this.requestQueue = [];
        this.lastRequestTime = 0;
    }

    /**
     * C-Level and Decision Maker titles
     */
    static get EXECUTIVE_TITLES() {
        return [
            // C-Suite
            'CEO', 'Chief Executive Officer',
            'CFO', 'Chief Financial Officer',
            'CTO', 'Chief Technology Officer',
            'CIO', 'Chief Information Officer',
            'COO', 'Chief Operating Officer',
            'CMO', 'Chief Marketing Officer',
            'CHRO', 'Chief Human Resources Officer',
            'CPO', 'Chief Product Officer',
            'CDO', 'Chief Digital Officer',
            'CSO', 'Chief Strategy Officer',
            'CRO', 'Chief Revenue Officer',
            
            // Founders & Owners
            'Founder', 'Co-Founder', 'Owner', 'Co-Owner',
            'Managing Partner', 'Partner',
            
            // VP Level
            'VP', 'Vice President',
            'SVP', 'Senior Vice President',
            'EVP', 'Executive Vice President',
            
            // Director Level
            'Director', 'Managing Director',
            'General Manager', 'GM',
            
            // Head of Department
            'Head of', 'President'
        ];
    }

    /**
     * Initialize scraper
     */
    async initialize() {
        if (!this.options.apiKey) {
            throw new Error('Apollo API key is required. Set APOLLO_API_KEY environment variable or pass apiKey option.');
        }

        this.stats.startTime = Date.now();
        console.log('[ApolloScraper] Initialized successfully');
        return this;
    }

    /**
     * Rate limiting helper
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = (60 * 1000) / this.options.rateLimit; // ms between requests

        if (timeSinceLastRequest < minInterval) {
            const waitTime = minInterval - timeSinceLastRequest;
            console.log(`[ApolloScraper] Rate limiting: waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Make API request with retry logic
     */
    async makeApiRequest(endpoint, params = {}, method = 'GET') {
        await this.respectRateLimit();

        const config = {
            method,
            url: `${this.options.baseUrl}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Api-Key': this.options.apiKey
            },
            timeout: this.options.timeout
        };

        if (method === 'GET') {
            config.params = params;
        } else {
            config.data = params;
        }

        try {
            const response = await retryWithBackoff(
                async () => await axios(config),
                this.options.retryAttempts,
                this.options.retryDelay
            );

            this.stats.apiCalls++;
            
            // Track credits if available
            if (response.headers['x-daily-credits-used']) {
                this.stats.creditsUsed = parseInt(response.headers['x-daily-credits-used']);
            }

            return response.data;
        } catch (error) {
            console.error(`[ApolloScraper] API request failed:`, error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}`, error.response.data);
            }
            throw error;
        }
    }

    /**
     * Search for people (executives) at a company
     * @param {Object} filters - Search filters
     * @returns {Promise<Array>} Array of contact objects
     */
    async searchPeople(filters = {}) {
        const {
            companyName,
            companyDomain,
            location = ['United Arab Emirates', 'Dubai'],
            titles = ApolloScraper.EXECUTIVE_TITLES,
            seniorityLevels = ['founder', 'c_suite', 'vp', 'director', 'partner'],
            page = 1,
            perPage = 25
        } = filters;

        console.log(`[ApolloScraper] Searching people at ${companyName || companyDomain}...`);

        const searchParams = {
            page,
            per_page: perPage,
            person_locations: Array.isArray(location) ? location : [location],
            person_seniorities: seniorityLevels
        };

        // Add company filters
        if (companyDomain) {
            searchParams.organization_domains = [companyDomain];
        } else if (companyName) {
            searchParams.organization_names = [companyName];
        }

        // Add title filters (Apollo supports title keywords)
        if (titles && titles.length > 0) {
            searchParams.person_titles = titles.slice(0, 10); // Limit to avoid URL length issues
        }

        try {
            const result = await this.makeApiRequest('/mixed_people/search', searchParams, 'POST');

            const contacts = (result.people || []).map(person => this.normalizePerson(person));

            console.log(`[ApolloScraper] Found ${contacts.length} contacts (Page ${page})`);
            this.stats.successful += contacts.length;

            return {
                contacts,
                pagination: result.pagination || {},
                creditsUsed: this.stats.creditsUsed
            };
        } catch (error) {
            console.error(`[ApolloScraper] Search failed:`, error.message);
            this.stats.failed++;
            throw error;
        }
    }

    /**
     * Enrich a person by email or LinkedIn URL
     * @param {Object} params - { email, linkedin_url, or organization_name + person_name }
     * @returns {Promise<Object>} Enriched contact object
     */
    async enrichPerson(params) {
        console.log(`[ApolloScraper] Enriching person:`, params.email || params.linkedin_url);

        try {
            const result = await this.makeApiRequest('/people/match', params, 'POST');

            if (result.person) {
                this.stats.successful++;
                return this.normalizePerson(result.person);
            } else {
                this.stats.failed++;
                return null;
            }
        } catch (error) {
            console.error(`[ApolloScraper] Enrichment failed:`, error.message);
            this.stats.failed++;
            return null;
        }
    }

    /**
     * Get company information
     * @param {Object} params - { domain or name }
     * @returns {Promise<Object>} Company object
     */
    async getCompanyInfo(params) {
        const { domain, name } = params;

        console.log(`[ApolloScraper] Getting company info for ${domain || name}...`);

        try {
            const result = await this.makeApiRequest('/organizations/enrich', {
                domain: domain || undefined,
                organization_name: name || undefined
            });

            if (result.organization) {
                return this.normalizeCompany(result.organization);
            }
            return null;
        } catch (error) {
            console.error(`[ApolloScraper] Company lookup failed:`, error.message);
            return null;
        }
    }

    /**
     * Search companies and get executives in one go
     * @param {Object} filters - Company search filters
     * @returns {Promise<Array>} Array of company objects with executives
     */
    async searchCompaniesWithExecutives(filters = {}) {
        const {
            location = ['United Arab Emirates'],
            industries = [],
            employeeCount = ['11-50', '51-200', '201-500', '501-1000', '1001-5000'],
            keywords = [],
            page = 1,
            perPage = 25,
            maxExecutivesPerCompany = 5
        } = filters;

        console.log(`[ApolloScraper] Searching companies in ${location.join(', ')}...`);

        const searchParams = {
            page,
            per_page: perPage,
            organization_locations: Array.isArray(location) ? location : [location]
        };

        if (industries.length > 0) {
            searchParams.organization_industry_tag_ids = industries;
        }

        if (employeeCount.length > 0) {
            searchParams.organization_num_employees_ranges = employeeCount;
        }

        if (keywords.length > 0) {
            searchParams.q_organization_keyword_tags = keywords;
        }

        try {
            const result = await this.makeApiRequest('/mixed_companies/search', searchParams, 'POST');
            const companies = result.accounts || [];

            console.log(`[ApolloScraper] Found ${companies.length} companies`);

            // For each company, get executives
            const companiesWithExecutives = [];

            for (const company of companies) {
                const companyData = this.normalizeCompany(company);

                // Search for executives at this company
                try {
                    const executivesResult = await this.searchPeople({
                        companyDomain: company.domain || company.website_url,
                        companyName: company.name,
                        location,
                        perPage: maxExecutivesPerCompany
                    });

                    companyData.executives = executivesResult.contacts || [];
                    companyData.executiveCount = executivesResult.contacts.length;

                    this.stats.totalProcessed++;
                } catch (error) {
                    console.error(`[ApolloScraper] Failed to get executives for ${company.name}`);
                    companyData.executives = [];
                    companyData.executiveCount = 0;
                }

                companiesWithExecutives.push(companyData);
            }

            return {
                companies: companiesWithExecutives,
                pagination: result.pagination || {},
                creditsUsed: this.stats.creditsUsed
            };
        } catch (error) {
            console.error(`[ApolloScraper] Company search failed:`, error.message);
            throw error;
        }
    }

    /**
     * Normalize person data to standard format
     */
    normalizePerson(person) {
        return {
            // Personal Info
            firstName: person.first_name || '',
            lastName: person.last_name || '',
            fullName: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
            title: person.title || '',
            seniority: person.seniority || '',
            
            // Contact Info
            email: person.email || person.personal_email || '',
            phone: this.formatPhone(person.phone_numbers?.[0]?.raw_number || person.corporate_phone),
            linkedinUrl: person.linkedin_url || '',
            
            // Company Info
            companyName: person.organization?.name || person.organization_name || '',
            companyDomain: person.organization?.primary_domain || '',
            companyIndustry: person.organization?.industry || '',
            companySize: person.organization?.estimated_num_employees || '',
            
            // Location
            city: person.city || '',
            state: person.state || '',
            country: person.country || '',
            
            // Additional Data
            photoUrl: person.photo_url || '',
            departments: person.departments || [],
            functions: person.functions || [],
            
            // Metadata
            apolloId: person.id,
            lastUpdated: person.updated_at || new Date().toISOString(),
            dataSource: 'apollo.io'
        };
    }

    /**
     * Normalize company data
     */
    normalizeCompany(company) {
        return {
            name: company.name || '',
            domain: company.primary_domain || company.website_url || '',
            industry: company.industry || '',
            description: company.short_description || company.description || '',
            
            // Size & Growth
            employeeCount: company.estimated_num_employees || 0,
            employeeRange: this.getEmployeeRange(company.estimated_num_employees),
            founded: company.founded_year || '',
            
            // Revenue
            revenue: company.annual_revenue || '',
            revenueRange: company.revenue_range || '',
            
            // Location
            street: company.street_address || '',
            city: company.city || '',
            state: company.state || '',
            country: company.country || '',
            postalCode: company.postal_code || '',
            
            // Online Presence
            website: company.website_url || '',
            linkedinUrl: company.linkedin_url || '',
            facebookUrl: company.facebook_url || '',
            twitterUrl: company.twitter_url || '',
            
            // Tech Stack
            technologies: company.technologies || [],
            techCategories: company.technology_names || [],
            
            // Metadata
            apolloId: company.id,
            lastUpdated: company.updated_at || new Date().toISOString(),
            dataSource: 'apollo.io',
            
            // Executives (will be populated separately)
            executives: [],
            executiveCount: 0
        };
    }

    /**
     * Format phone number
     */
    formatPhone(phone) {
        if (!phone) return '';
        
        // Clean and format phone
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        // Add UAE country code if missing
        if (!cleaned.startsWith('+') && !cleaned.startsWith('971')) {
            cleaned = '+971' + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Get employee range category
     */
    getEmployeeRange(count) {
        if (!count) return 'Unknown';
        if (count <= 10) return '1-10';
        if (count <= 50) return '11-50';
        if (count <= 200) return '51-200';
        if (count <= 500) return '201-500';
        if (count <= 1000) return '501-1000';
        if (count <= 5000) return '1001-5000';
        return '5000+';
    }

    /**
     * Get statistics
     */
    getStats() {
        this.stats.endTime = Date.now();
        const duration = this.stats.endTime - this.stats.startTime;

        return {
            ...this.stats,
            duration: `${(duration / 1000).toFixed(2)}s`,
            successRate: this.stats.totalProcessed > 0 
                ? `${((this.stats.successful / this.stats.totalProcessed) * 100).toFixed(1)}%`
                : '0%',
            creditsUsed: this.stats.creditsUsed
        };
    }

    /**
     * Cleanup
     */
    async close() {
        console.log('[ApolloScraper] Closing...');
        console.log('[ApolloScraper] Final Stats:', this.getStats());
    }
}

module.exports = ApolloScraper;
