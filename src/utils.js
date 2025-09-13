const _ = require('lodash');
const validator = require('validator');

const { VALIDATION, CATEGORIES, QUALITY_WEIGHTS, DUBAI_AREAS } = require('./constants');

/**
 * Utility functions for data processing, validation, and helper operations
 */

/**
 * Clean and validate phone number for UAE format
 * @param {string} phone - Raw phone number
 * @returns {string|null} - Cleaned phone number or null if invalid
 */
function cleanPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle different UAE phone formats
    if (cleaned.startsWith('00971')) {
        cleaned = `+971${cleaned.substring(5)}`;
    } else if (cleaned.startsWith('971')) {
        cleaned = `+971${cleaned.substring(3)}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = `+971${cleaned.substring(1)}`;
    } else if (!cleaned.startsWith('+971') && cleaned.length === 9) {
        cleaned = `+971${cleaned}`;
    }

    // Validate against UAE phone pattern
    return VALIDATION.UAE_PHONE.test(cleaned) ? cleaned : null;
}

/**
 * Clean and validate email address
 * @param {string} email - Raw email address
 * @returns {string|null} - Cleaned email or null if invalid
 */
function cleanEmail(email) {
    if (!email) return null;

    const cleaned = email.trim().toLowerCase();
    return validator.isEmail(cleaned) ? cleaned : null;
}

/**
 * Clean and validate website URL
 * @param {string} url - Raw URL
 * @returns {string|null} - Cleaned URL or null if invalid
 */
function cleanWebsite(url) {
    if (!url) return null;

    let cleaned = url.trim();

    // Add protocol if missing
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = `https://${cleaned}`;
    }

    return VALIDATION.WEBSITE.test(cleaned) ? cleaned : null;
}

/**
 * Clean and standardize address
 * @param {string} address - Raw address
 * @returns {string} - Cleaned address
 */
function cleanAddress(address) {
    if (!address) return '';

    return address
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/,+/g, ',')
        .replace(/,\s*$/, ''); // Remove trailing comma
}

/**
 * Extract coordinates from Google Maps URL
 * @param {string} url - Google Maps URL
 * @returns {Object|null} - {lat, lng} or null if not found
 */
function extractCoordinatesFromUrl(url) {
    if (!url) return null;

    const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/,
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
        /q=(-?\d+\.\d+),(-?\d+\.\d+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);

            // Validate coordinates are within Dubai bounds
            if (lat >= VALIDATION.COORDINATES.LAT_RANGE[0]
                && lat <= VALIDATION.COORDINATES.LAT_RANGE[1]
                && lng >= VALIDATION.COORDINATES.LNG_RANGE[0]
                && lng <= VALIDATION.COORDINATES.LNG_RANGE[1]) {
                return { lat, lng };
            }
        }
    }

    return null;
}

/**
 * Parse business hours from text
 * @param {string} hoursText - Raw hours text
 * @returns {Object} - Parsed hours object
 */
function parseBusinessHours(hoursText) {
    if (!hoursText) return null;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = {};

    try {
        // Handle different hour formats
        const lines = hoursText.split('\n').filter((line) => line.trim());

        for (const line of lines) {
            const dayMatch = daysOfWeek.find((day) => line.toLowerCase().includes(day.toLowerCase()));
            if (dayMatch) {
                const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?\s*[-–]\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
                if (timeMatch) {
                    hours[dayMatch] = timeMatch[1].trim();
                } else if (line.toLowerCase().includes('closed')) {
                    hours[dayMatch] = 'Closed';
                }
            }
        }

        return Object.keys(hours).length > 0 ? hours : null;
    } catch (error) {
        console.warn('Error parsing business hours:', error.message);
        return null;
    }
}

/**
 * Calculate data quality score for a business
 * @param {Object} business - Business data object
 * @returns {number} - Quality score (0-100)
 */
function calculateQualityScore(business) {
    let score = 0;

    if (business.phone) score += QUALITY_WEIGHTS.HAS_PHONE;
    if (business.website) score += QUALITY_WEIGHTS.HAS_WEBSITE;
    if (business.email) score += QUALITY_WEIGHTS.HAS_EMAIL;
    if (business.businessHours) score += QUALITY_WEIGHTS.HAS_HOURS;
    if (business.rating && business.rating > 0) score += QUALITY_WEIGHTS.HAS_RATING;
    if (business.description) score += QUALITY_WEIGHTS.HAS_DESCRIPTION;
    if (business.coordinates) score += QUALITY_WEIGHTS.HAS_COORDINATES;
    if (business.address && isValidDubaiAddress(business.address)) score += QUALITY_WEIGHTS.VALID_ADDRESS;
    
    // Additional scoring for new fields
    if (business.contactPersons && business.contactPersons.length > 0) score += 5;
    if (business.additionalEmails && business.additionalEmails.length > 0) score += 3;
    if (business.businessOwner) score += 3;
    if (business.locationDetails && business.locationDetails.area) score += 2;

    return Math.min(100, score);
}

/**
 * Validate if address is in Dubai
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid Dubai address
 */
function isValidDubaiAddress(address) {
    if (!address) return false;

    const addressLower = address.toLowerCase();
    return addressLower.includes('dubai')
           || addressLower.includes('uae')
           || addressLower.includes('united arab emirates')
           || DUBAI_AREAS.some((area) => addressLower.includes(area.toLowerCase()));
}

/**
 * Categorize business based on name and description
 * @param {string} name - Business name
 * @param {string} category - Original category
 * @param {string} description - Business description
 * @returns {string} - Standardized category
 */
function categorizeBusiness(name, category, description) {
    const text = `${name} ${category} ${description}`.toLowerCase();

    for (const [key, categories] of Object.entries(CATEGORIES)) {
        for (const cat of categories) {
            if (text.includes(cat.toLowerCase())) {
                return cat;
            }
        }
    }

    // Return original category if no match found
    return category || 'General Business';
}

/**
 * Remove duplicate businesses based on name and address
 * @param {Array} businesses - Array of business objects
 * @returns {Array} - Deduplicated array
 */
function removeDuplicates(businesses) {
    const seen = new Set();

    return businesses.filter((business) => {
        const key = `${business.businessName?.toLowerCase()}_${business.address?.toLowerCase()}`;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random delay within range
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {number} - Random delay
 */
function randomDelay(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} - Result of function or throws error
 */
async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }

            const delay = baseDelay * 2 ** (attempt - 1);
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
}

/**
 * Format timestamp for logging
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Sanitize filename for safe file operations
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

/**
 * Calculate memory usage
 * @returns {Object} - Memory usage statistics
 */
function getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
    };
}

/**
 * Validate input parameters
 * @param {Object} input - Input object to validate
 * @returns {Object} - Validation result with errors
 */
function validateInput(input) {
    const errors = [];

    if (!input.categories || !Array.isArray(input.categories) || input.categories.length === 0) {
        errors.push('Categories must be a non-empty array');
    }

    if (input.maxResultsPerCategory && (input.maxResultsPerCategory < 10 || input.maxResultsPerCategory > 1000)) {
        errors.push('maxResultsPerCategory must be between 10 and 1000');
    }

    if (input.googleSheetsConfig && input.googleSheetsConfig.enabled) {
        if (!input.googleSheetsConfig.spreadsheetId) {
            errors.push('Google Sheets spreadsheet ID is required when Sheets export is enabled');
        }

        if (!input.googleSheetsConfig.serviceAccountKey) {
            errors.push('Google Sheets service account key is required when Sheets export is enabled');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Extract email addresses from text content
 * @param {string} text - Text content to search for emails
 * @returns {Array} - Array of found email addresses
 */
function extractEmailsFromText(text) {
    if (!text) return [];
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    
    return matches
        .map(email => cleanEmail(email))
        .filter(email => email !== null)
        .filter((email, index, arr) => arr.indexOf(email) === index); // Remove duplicates
}

/**
 * Extract contact person information from text
 * @param {string} text - Text content to search for contact names
 * @returns {Array} - Array of potential contact person names
 */
function extractContactPersons(text) {
    if (!text) return [];
    
    const patterns = [
        /(?:contact|owner|manager|director|ceo|founder|proprietor):\s*(?:mr\.?\s+|mrs\.?\s+|ms\.?\s+|dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z-]+)*)/gi,
        /(?:mr\.?\s+|mrs\.?\s+|ms\.?\s+|dr\.?\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z-]+)*)/gi,
        /([A-Z][a-z]+\s+[A-Z][a-z-]+)(?:\s*-\s*(?:owner|manager|director|ceo|founder))/gi
    ];
    
    const contacts = [];
    
    patterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match[1] && match[1].length > 3) {
                contacts.push(match[1].trim());
            }
        }
    });
    
    return [...new Set(contacts)]; // Remove duplicates
}

/**
 * Extract office/shop location details from address
 * @param {string} address - Full address string
 * @returns {Object} - Parsed location details
 */
function parseLocationDetails(address) {
    if (!address) return {};
    
    const details = {
        streetAddress: null,
        area: null,
        emirate: null,
        buildingNumber: null,
        floor: null,
        office: null
    };
    
    // Extract building number
    const buildingMatch = address.match(/\b(\d+)[,\s]/);
    if (buildingMatch) {
        details.buildingNumber = buildingMatch[1];
    }
    
    // Extract floor information
    const floorMatch = address.match(/(?:floor|level|fl\.?)\s*(\d+)/gi);
    if (floorMatch) {
        details.floor = floorMatch[0];
    }
    
    // Extract office number
    const officeMatch = address.match(/(?:office|shop|unit|suite)\s*(?:no\.?\s*)?(\w+)/gi);
    if (officeMatch) {
        details.office = officeMatch[0];
    }
    
    // Extract area (common Dubai areas)
    const dubaiAreas = [
        'Dubai Marina', 'JBR', 'Downtown Dubai', 'Business Bay', 'DIFC', 'Media City',
        'Internet City', 'Knowledge Village', 'Jumeirah', 'Deira', 'Bur Dubai',
        'Al Barsha', 'Sheikh Zayed Road', 'Trade Centre', 'Festival City',
        'Silicon Oasis', 'Sports City', 'Motor City', 'Arabian Ranches'
    ];
    
    for (const area of dubaiAreas) {
        if (address.toLowerCase().includes(area.toLowerCase())) {
            details.area = area;
            break;
        }
    }
    
    // Extract emirate
    if (address.toLowerCase().includes('dubai')) {
        details.emirate = 'Dubai';
    } else if (address.toLowerCase().includes('abu dhabi')) {
        details.emirate = 'Abu Dhabi';
    } else if (address.toLowerCase().includes('sharjah')) {
        details.emirate = 'Sharjah';
    }
    
    return details;
}

module.exports = {
    cleanPhoneNumber,
    cleanEmail,
    cleanWebsite,
    cleanAddress,
    extractCoordinatesFromUrl,
    parseBusinessHours,
    calculateQualityScore,
    isValidDubaiAddress,
    categorizeBusiness,
    removeDuplicates,
    sleep,
    randomDelay,
    retryWithBackoff,
    getTimestamp,
    sanitizeFilename,
    getMemoryUsage,
    validateInput,
    extractEmailsFromText,
    extractContactPersons,
    parseLocationDetails
};
