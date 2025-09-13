// Jest setup file
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.APIFY_HEADLESS = '1';
process.env.APIFY_LOG_LEVEL = 'ERROR';

// Increase timeout for integration tests
jest.setTimeout(60000);

// Mock console methods to reduce noise during tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Global test utilities
global.testUtils = {
    createMockBusiness: (overrides = {}) => ({
        businessName: 'Test Business',
        category: 'Restaurant',
        address: '123 Test Street, Dubai',
        phone: '+971501234567',
        website: 'https://test-business.com',
        rating: 4.5,
        reviewCount: 100,
        businessHours: {
            'Monday': '9:00 AM - 10:00 PM',
            'Tuesday': '9:00 AM - 10:00 PM'
        },
        coordinates: { lat: 25.2048, lng: 55.2708 },
        googleMapsUrl: 'https://maps.google.com/test',
        primaryPhoto: 'https://test.com/photo.jpg',
        description: 'Test business description',
        dataQualityScore: 85,
        verificationStatus: 'Verified',
        lastUpdated: new Date().toISOString(),
        ...overrides
    }),
    
    createMockInput: (overrides = {}) => ({
        categories: ['restaurants dubai'],
        maxResultsPerCategory: 10,
        dataQualityLevel: 'standard',
        googleSheetsConfig: {
            enabled: false
        },
        concurrency: {
            maxConcurrency: 1,
            requestDelay: 1000,
            retryAttempts: 2
        },
        ...overrides
    })
};

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});