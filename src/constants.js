// Application constants and configuration
module.exports = {
    // Google Maps URLs and selectors
    GOOGLE_MAPS: {
        BASE_URL: 'https://www.google.com/maps',
        SEARCH_URL: 'https://www.google.com/maps/search',
        SELECTORS: {
            SEARCH_BOX: 'input[id="searchboxinput"]',
            SEARCH_BUTTON: 'button[id="searchbox-searchbutton"]',
            RESULT_ITEMS: '.hfpxzc',  // Updated to working selector
            BUSINESS_NAME: 'h1[data-attrid="title"]',
            BUSINESS_NAME_ALT: '.DUwDvf.lfPIob',
            ADDRESS: 'button[data-item-id="address"]',
            ADDRESS_ALT: '.Io6YTe.fontBodyMedium.kR99db.fdkmkc',
            PHONE: 'button[data-item-id^="phone"]',
            PHONE_ALT: '.Io6YTe.fontBodyMedium.kR99db.fdkmkc[aria-label*="phone"]',
            WEBSITE: 'a[data-item-id="authority"]',
            WEBSITE_ALT: '.Io6YTe.fontBodyMedium.kR99db.fdkmkc[href^="http"]',
            EMAIL: 'a[href^="mailto:"]',
            EMAIL_ALT: '.Io6YTe.fontBodyMedium.kR99db.fdkmkc[href^="mailto:"]',
            SOCIAL_MEDIA: {
                FACEBOOK: 'a[href*="facebook.com"], a[href*="fb.com"]',
                INSTAGRAM: 'a[href*="instagram.com"]',
                TWITTER: 'a[href*="twitter.com"], a[href*="x.com"]',
                LINKEDIN: 'a[href*="linkedin.com"]',
                YOUTUBE: 'a[href*="youtube.com"]',
                TIKTOK: 'a[href*="tiktok.com"]',
                SNAPCHAT: 'a[href*="snapchat.com"]',
                WHATSAPP: 'a[href*="wa.me"], a[href*="whatsapp.com"]',
                TELEGRAM: 'a[href*="t.me"], a[href*="telegram.me"]',
                GENERAL: 'a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="youtube.com"], a[href*="tiktok.com"], a[href*="snapchat.com"], a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="t.me"], a[href*="telegram.me"]'
            },
            CONTACT_INFO: '.Io6YTe.fontBodyMedium.kR99db.fdkmkc',
            BUSINESS_OWNER: '.mgr77e .fontBodySmall',
            ADDITIONAL_DETAILS: '.section-info-text',
            ABOUT_SECTION: '.section-info',
            ALL_TEXT_CONTENT: '.fontBodyMedium, .fontBodySmall, .fontHeadlineSmall',
            RATING: '.F7nice span[aria-hidden="true"]',
            RATING_ALT: '.ceNzKf[aria-label*="stars"]',
            REVIEW_COUNT: '.F7nice button span',
            REVIEW_COUNT_ALT: '.ceNzKf[aria-label*="reviews"]',
            HOURS: '.t39EBf.GUrTXd',
            HOURS_ALT: '.OqCZI.fontBodyMedium.WVXvdc',
            CATEGORY: '.DkEaL',
            CATEGORY_ALT: '.YhemCb',
            DESCRIPTION: '.PYvSYb',
            PRICE_RANGE: '.mgr77e .fontBodyMedium span',
            PHOTOS: 'img[decoding="async"]',
            LOAD_MORE: '.HlvSq',
            NEXT_PAGE: '[aria-label="Next page"]',
            CLOSE_PANEL: 'button[aria-label="Close"]'
        },
        WAIT_SELECTORS: {
            RESULTS_LOADED: '.Nv2PK',
            BUSINESS_LOADED: '.DUwDvf',
            MAP_LOADED: '#searchbox'
        }
    },

    // Data validation patterns
    VALIDATION: {
        UAE_PHONE: /^(\+971|971|0)(2|3|4|6|7|9|50|51|52|54|55|56|58)\d{7}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        WEBSITE: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        COORDINATES: {
            LAT_RANGE: [24.5, 26.0], // Dubai latitude range
            LNG_RANGE: [54.5, 56.0] // Dubai longitude range
        }
    },

    // Business categories mapping
    CATEGORIES: {
        restaurants: ['Restaurant', 'Cafe', 'Fast Food', 'Fine Dining', 'Coffee Shop'],
        retail: ['Retail Store', 'Shopping Mall', 'Boutique', 'Electronics Store', 'Furniture Store'],
        consulting: ['Business Consultant', 'Management Consultant', 'IT Consultant', 'Strategy Consultant'],
        tech: ['IT Company', 'Software Development', 'Digital Agency', 'Tech Startup'],
        healthcare: ['Clinic', 'Hospital', 'Pharmacy', 'Medical Center', 'Dental Clinic'],
        beauty: ['Beauty Salon', 'Spa', 'Barbershop', 'Nail Salon', 'Wellness Center'],
        fitness: ['Gym', 'Fitness Center', 'Yoga Studio', 'Personal Trainer', 'Sports Club'],
        realestate: ['Real Estate Agency', 'Property Developer', 'Real Estate Broker'],
        legal: ['Law Firm', 'Legal Services', 'Attorney', 'Legal Consultant'],
        accounting: ['Accounting Firm', 'Tax Consultant', 'Financial Services', 'Bookkeeping'],
        marketing: ['Marketing Agency', 'Advertising Agency', 'PR Agency', 'Digital Marketing'],
        construction: ['Construction Company', 'Contractor', 'Engineering Services'],
        trading: ['Trading Company', 'Import/Export', 'Distributor', 'Wholesale'],
        logistics: ['Logistics Company', 'Shipping', 'Freight Forwarder', 'Courier Service'],
        education: ['Training Center', 'Language School', 'Driving School', 'Tutoring']
    },

    // Error types and messages
    ERRORS: {
        CAPTCHA_DETECTED: 'CAPTCHA_DETECTED',
        RATE_LIMITED: 'RATE_LIMITED',
        NO_RESULTS: 'NO_RESULTS',
        INVALID_LOCATION: 'INVALID_LOCATION',
        NETWORK_ERROR: 'NETWORK_ERROR',
        PARSING_ERROR: 'PARSING_ERROR',
        GOOGLE_SHEETS_ERROR: 'GOOGLE_SHEETS_ERROR'
    },

    // Performance settings
    PERFORMANCE: {
        DEFAULT_TIMEOUT: 20000,
        NAVIGATION_TIMEOUT: 30000,
        ELEMENT_WAIT_TIMEOUT: 8000,
        SCROLL_DELAY: 1000,
        MAX_SCROLL_ATTEMPTS: 10,
        BATCH_SIZE: 100,
        MAX_RETRIES: 1,
        RETRY_DELAY: 3000,
        MEMORY_LIMIT_MB: 4096
    },

    // Google Sheets configuration
    GOOGLE_SHEETS: {
        SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
        BATCH_SIZE: 100,
        MAX_CELLS_PER_REQUEST: 40000,
        RATE_LIMIT_DELAY: 100,
        HEADERS: [
            'Business Name',
            'Category',
            'Address',
            'Phone',
            'Website',
            'Email',
            'Additional Emails',
            'Contact Persons',
            'Business Owner',
            'Office Location Details',
            'Area',
            'Emirate',
            'Building Number',
            'Floor',
            'Office/Suite',
            'Rating',
            'Review Count',
            'Business Hours',
            'Latitude',
            'Longitude',
            'Google Maps URL',
            'Primary Photo URL',
            'Description',
            'Price Range',
            'Last Updated',
            'Data Quality Score',
            'Verification Status'
        ]
    },

    // Data quality scoring weights
    QUALITY_WEIGHTS: {
        HAS_PHONE: 20,
        HAS_WEBSITE: 15,
        HAS_EMAIL: 10,
        HAS_HOURS: 15,
        HAS_RATING: 10,
        HAS_DESCRIPTION: 10,
        HAS_COORDINATES: 10,
        VALID_ADDRESS: 10
    },

    // Dubai specific areas for location validation
    DUBAI_AREAS: [
        'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'DIFC', 'JLT', 'Deira',
        'Bur Dubai', 'Jumeirah', 'Al Barsha', 'Motor City', 'Sports City',
        'International City', 'Dubai Investment Park', 'Emirates Hills',
        'The Greens', 'Arabian Ranches', 'Mirdif', 'Nad Al Sheba',
        'Al Mizhar', 'Al Warqa', 'Al Khawaneej', 'Academic City'
    ],

    // Default user agents for rotation
    USER_AGENTS: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ]
};
