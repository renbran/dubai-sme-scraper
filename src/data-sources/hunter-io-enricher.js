/**
 * Hunter.io Email Finder Integration
 * 
 * Free Plan: 25 email searches + 50 verifications per month
 * Documentation: https://hunter.io/api-documentation/v2
 * 
 * Features:
 * - Domain search: Find all email addresses for a company domain
 * - Email finder: Find specific person's email at company
 * - Email verification: Verify if an email exists
 * - Company data enrichment
 */

const axios = require('axios');

class HunterIOEnricher {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.hunter.io/v2';
        this.requestCount = 0;
        this.maxRequests = 25; // Free plan limit
    }

    /**
     * Find all email addresses for a company domain
     * Uses 1 credit per search
     */
    async searchDomainEmails(domain, options = {}) {
        try {
            this.requestCount++;
            if (this.requestCount > this.maxRequests) {
                console.warn(`⚠️  Hunter.io: Approaching free plan limit (${this.requestCount}/${this.maxRequests})`);
            }

            const params = {
                domain: domain,
                api_key: this.apiKey,
                limit: options.limit || 10,
                offset: options.offset || 0,
                type: options.type || 'personal', // 'personal' or 'generic'
                seniority: options.seniority || null, // 'executive', 'senior', 'mid', 'junior'
                department: options.department || null // 'executive', 'it', 'finance', 'management', etc.
            };

            // Remove null parameters
            Object.keys(params).forEach(key => params[key] === null && delete params[key]);

            console.log(`[Hunter.io] Searching emails for domain: ${domain}`);
            
            const response = await axios.get(`${this.baseUrl}/domain-search`, { params });

            if (response.data && response.data.data) {
                const result = response.data.data;
                
                return {
                    domain: result.domain,
                    organization: result.organization,
                    pattern: result.pattern, // Email pattern like {first}.{last}
                    emails: result.emails || [],
                    emailCount: result.emails ? result.emails.length : 0,
                    webmail: result.webmail,
                    accept_all: result.accept_all,
                    disposable: result.disposable
                };
            }

            return null;
        } catch (error) {
            if (error.response?.status === 401) {
                console.error('❌ Hunter.io: Invalid API key');
            } else if (error.response?.status === 429) {
                console.error('❌ Hunter.io: Rate limit exceeded (25 searches/month on free plan)');
            } else {
                console.error(`[Hunter.io] Error searching ${domain}:`, error.message);
            }
            return null;
        }
    }

    /**
     * Find specific person's email at a company
     * Uses 1 credit per search
     */
    async findPersonEmail(domain, firstName, lastName) {
        try {
            this.requestCount++;
            if (this.requestCount > this.maxRequests) {
                console.warn(`⚠️  Hunter.io: Approaching free plan limit (${this.requestCount}/${this.maxRequests})`);
            }

            const params = {
                domain: domain,
                first_name: firstName,
                last_name: lastName,
                api_key: this.apiKey
            };

            console.log(`[Hunter.io] Finding email for ${firstName} ${lastName} at ${domain}`);
            
            const response = await axios.get(`${this.baseUrl}/email-finder`, { params });

            if (response.data && response.data.data) {
                const result = response.data.data;
                
                return {
                    email: result.email,
                    score: result.score, // 0-100 confidence score
                    firstName: result.first_name,
                    lastName: result.last_name,
                    position: result.position,
                    twitter: result.twitter,
                    linkedin: result.linkedin_url,
                    phone: result.phone_number,
                    company: result.company,
                    sources: result.sources
                };
            }

            return null;
        } catch (error) {
            if (error.response?.status === 429) {
                console.error('❌ Hunter.io: Rate limit exceeded');
            } else {
                console.error(`[Hunter.io] Error finding email:`, error.message);
            }
            return null;
        }
    }

    /**
     * Verify if an email address exists
     * Uses verification credits (50 free per month)
     */
    async verifyEmail(email) {
        try {
            const params = {
                email: email,
                api_key: this.apiKey
            };

            console.log(`[Hunter.io] Verifying email: ${email}`);
            
            const response = await axios.get(`${this.baseUrl}/email-verifier`, { params });

            if (response.data && response.data.data) {
                const result = response.data.data;
                
                return {
                    email: result.email,
                    status: result.status, // 'valid', 'invalid', 'accept_all', 'webmail', 'disposable', 'unknown'
                    result: result.result, // 'deliverable', 'undeliverable', 'risky', 'unknown'
                    score: result.score, // 0-100
                    regexp: result.regexp,
                    gibberish: result.gibberish,
                    disposable: result.disposable,
                    webmail: result.webmail,
                    mx_records: result.mx_records,
                    smtp_server: result.smtp_server,
                    smtp_check: result.smtp_check,
                    accept_all: result.accept_all,
                    block: result.block,
                    sources: result.sources
                };
            }

            return null;
        } catch (error) {
            console.error(`[Hunter.io] Error verifying ${email}:`, error.message);
            return null;
        }
    }

    /**
     * Extract domain from company name or website
     */
    extractDomain(companyNameOrUrl) {
        if (!companyNameOrUrl) return null;

        // If it's a URL, extract domain
        if (companyNameOrUrl.includes('http') || companyNameOrUrl.includes('www')) {
            try {
                const url = new URL(companyNameOrUrl.startsWith('http') ? companyNameOrUrl : `https://${companyNameOrUrl}`);
                return url.hostname.replace('www.', '');
            } catch (e) {
                return null;
            }
        }

        // Try to construct domain from company name
        const cleanName = companyNameOrUrl
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '');

        return `${cleanName}.com`;
    }

    /**
     * Enrich a business with Hunter.io data
     */
    async enrichBusiness(business) {
        const website = business.website || business.url;
        
        if (!website || website === 'Not available') {
            console.log(`[Hunter.io] No website for ${business.name}, skipping...`);
            return business;
        }

        const domain = this.extractDomain(website);
        
        if (!domain) {
            console.log(`[Hunter.io] Could not extract domain from ${website}`);
            return business;
        }

        // Search for executive emails
        const emailData = await this.searchDomainEmails(domain, {
            seniority: 'executive',
            limit: 5
        });

        if (emailData && emailData.emails && emailData.emails.length > 0) {
            console.log(`✅ Found ${emailData.emails.length} executives at ${business.name}`);
            
            business.hunterData = {
                domain: emailData.domain,
                organization: emailData.organization,
                emailPattern: emailData.pattern,
                executives: emailData.emails.map(e => ({
                    firstName: e.first_name,
                    lastName: e.last_name,
                    email: e.value,
                    position: e.position,
                    seniority: e.seniority,
                    department: e.department,
                    linkedin: e.linkedin,
                    twitter: e.twitter,
                    phone: e.phone_number,
                    confidence: e.confidence
                }))
            };

            // Add first executive as primary contact
            if (emailData.emails[0]) {
                const exec = emailData.emails[0];
                business.contactPerson = `${exec.first_name} ${exec.last_name}`;
                business.contactEmail = exec.value;
                business.contactPosition = exec.position;
                business.contactLinkedIn = exec.linkedin;
            }
        } else {
            console.log(`ℹ️  No executives found for ${business.name}`);
            business.hunterData = { searched: true, found: false };
        }

        // Add delay to respect rate limits
        await this.sleep(1000);

        return business;
    }

    /**
     * Batch enrich multiple businesses
     */
    async enrichBusinesses(businesses, maxEnrichments = 25) {
        console.log(`\n🔍 Enriching ${Math.min(businesses.length, maxEnrichments)} businesses with Hunter.io...`);
        
        const enriched = [];
        let count = 0;

        for (const business of businesses) {
            if (count >= maxEnrichments) {
                console.log(`\n⚠️  Reached Hunter.io free plan limit (${maxEnrichments} searches)`);
                console.log(`💡 ${businesses.length - count} businesses remain unenriched`);
                break;
            }

            const enrichedBusiness = await this.enrichBusiness(business);
            enriched.push(enrichedBusiness);
            count++;

            // Progress indicator
            if (count % 5 === 0) {
                console.log(`📊 Progress: ${count}/${Math.min(businesses.length, maxEnrichments)} businesses enriched`);
            }
        }

        // Add remaining businesses without enrichment
        if (count < businesses.length) {
            enriched.push(...businesses.slice(count));
        }

        console.log(`\n✅ Hunter.io enrichment complete: ${count} businesses processed`);
        console.log(`📧 Found executives at ${enriched.filter(b => b.hunterData?.found !== false).length} companies`);

        return enriched;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get account information (remaining credits)
     */
    async getAccountInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/account`, {
                params: { api_key: this.apiKey }
            });

            if (response.data && response.data.data) {
                const account = response.data.data;
                return {
                    firstName: account.first_name,
                    lastName: account.last_name,
                    email: account.email,
                    plan: account.plan_name,
                    requestsAvailable: account.requests.searches.available,
                    requestsUsed: account.requests.searches.used,
                    verificationsAvailable: account.requests.verifications.available,
                    verificationsUsed: account.requests.verifications.used
                };
            }

            return null;
        } catch (error) {
            console.error('[Hunter.io] Error fetching account info:', error.message);
            return null;
        }
    }
}

module.exports = HunterIOEnricher;
