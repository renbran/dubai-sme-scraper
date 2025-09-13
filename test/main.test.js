const DubaiSMEActor = require('../src/main');
const GoogleMapsScraper = require('../src/scraper');
const GoogleSheetsManager = require('../src/google-sheets');
const { validateInput, cleanPhoneNumber, removeDuplicates } = require('../src/utils');

// Mock Apify for testing
jest.mock('apify', () => ({
    getInput: jest.fn(),
    openDataset: jest.fn(),
    createProxyConfiguration: jest.fn(),
    setValue: jest.fn()
}));

describe('Dubai SME Actor', () => {
    let mockInput;

    beforeEach(() => {
        mockInput = {
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
            }
        };
    });

    describe('Input Validation', () => {
        test('should validate correct input', () => {
            const result = validateInput(mockInput);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject empty categories', () => {
            mockInput.categories = [];
            const result = validateInput(mockInput);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Categories must be a non-empty array');
        });

        test('should reject invalid maxResultsPerCategory', () => {
            mockInput.maxResultsPerCategory = 5;
            const result = validateInput(mockInput);
            expect(result.isValid).toBe(false);
        });

        test('should require Google Sheets config when enabled', () => {
            mockInput.googleSheetsConfig = {
                enabled: true,
                spreadsheetId: '',
                serviceAccountKey: ''
            };
            const result = validateInput(mockInput);
            expect(result.isValid).toBe(false);
        });
    });

    describe('Phone Number Cleaning', () => {
        test('should clean UAE phone numbers correctly', () => {
            expect(cleanPhoneNumber('+971501234567')).toBe('+971501234567');
            expect(cleanPhoneNumber('971501234567')).toBe('+971501234567');
            expect(cleanPhoneNumber('0501234567')).toBe('+971501234567');
            expect(cleanPhoneNumber('050 123 4567')).toBe('+971501234567');
            expect(cleanPhoneNumber('invalid')).toBe(null);
        });
    });

    describe('Duplicate Removal', () => {
        test('should remove duplicate businesses', () => {
            const businesses = [
                { businessName: 'Test Restaurant', address: '123 Main St' },
                { businessName: 'Test Restaurant', address: '123 Main St' },
                { businessName: 'Another Business', address: '456 Side St' }
            ];
            
            const unique = removeDuplicates(businesses);
            expect(unique).toHaveLength(2);
        });
    });
});

describe('Google Maps Scraper', () => {
    let scraper;

    beforeEach(() => {
        scraper = new GoogleMapsScraper({
            headless: true,
            maxConcurrency: 1
        });
    });

    afterEach(async () => {
        if (scraper) {
            await scraper.close();
        }
    });

    test('should initialize browser', async () => {
        await scraper.initialize();
        expect(scraper.browser).toBeDefined();
    });

    test('should create page with proper configuration', async () => {
        await scraper.initialize();
        const page = await scraper.createPage();
        expect(page).toBeDefined();
        await page.close();
    });

    // Integration test - only run if INTEGRATION_TEST env var is set
    if (process.env.INTEGRATION_TEST) {
        test('should search for businesses', async () => {
            await scraper.initialize();
            const businesses = await scraper.searchBusinesses('coffee shops dubai', 5);
            expect(Array.isArray(businesses)).toBe(true);
            expect(businesses.length).toBeGreaterThan(0);
            
            // Verify business structure
            if (businesses.length > 0) {
                const business = businesses[0];
                expect(business).toHaveProperty('businessName');
                expect(business).toHaveProperty('address');
                expect(typeof business.businessName).toBe('string');
            }
        }, 60000); // 60 second timeout for integration test
    }
});

describe('Google Sheets Manager', () => {
    let sheetsManager;
    const mockConfig = {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetName: 'Test_Sheet',
        serviceAccountKey: JSON.stringify({
            type: 'service_account',
            project_id: 'test-project',
            private_key_id: 'test-key-id',
            private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
            client_email: 'test@test-project.iam.gserviceaccount.com',
            client_id: '123456789',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token'
        })
    };

    beforeEach(() => {
        sheetsManager = new GoogleSheetsManager(mockConfig);
    });

    test('should parse service account key', () => {
        expect(() => {
            new GoogleSheetsManager(mockConfig);
        }).not.toThrow();
    });

    test('should convert businesses to rows', () => {
        const businesses = [
            {
                businessName: 'Test Business',
                category: 'Restaurant',
                address: '123 Test St',
                phone: '+971501234567',
                website: 'https://test.com',
                rating: 4.5,
                reviewCount: 100
            }
        ];

        const rows = sheetsManager.convertBusinessesToRows(businesses);
        expect(rows).toHaveLength(1);
        expect(rows[0][0]).toBe('Test Business');
        expect(rows[0][1]).toBe('Restaurant');
    });

    test('should format column letters correctly', () => {
        expect(sheetsManager.getColumnLetter(1)).toBe('A');
        expect(sheetsManager.getColumnLetter(26)).toBe('Z');
        expect(sheetsManager.getColumnLetter(27)).toBe('AA');
    });

    // Integration test for Google Sheets - only run with valid credentials
    if (process.env.GOOGLE_SHEETS_TEST && process.env.SERVICE_ACCOUNT_KEY) {
        test('should connect to Google Sheets', async () => {
            const testConfig = {
                ...mockConfig,
                serviceAccountKey: process.env.SERVICE_ACCOUNT_KEY,
                spreadsheetId: process.env.TEST_SPREADSHEET_ID
            };
            
            const testManager = new GoogleSheetsManager(testConfig);
            const result = await testManager.testConnection();
            expect(result.success).toBe(true);
        }, 30000);
    }
});

// Performance Tests
describe('Performance Tests', () => {
    test('should handle memory efficiently', () => {
        const largeBusinessArray = Array(1000).fill({
            businessName: 'Test Business',
            address: 'Test Address',
            phone: '+971501234567'
        });

        const startMemory = process.memoryUsage().heapUsed;
        const unique = removeDuplicates(largeBusinessArray);
        const endMemory = process.memoryUsage().heapUsed;
        
        expect(unique).toHaveLength(1); // All are duplicates
        expect(endMemory - startMemory).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
});

// Error Handling Tests
describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
        const scraper = new GoogleMapsScraper({ timeout: 1000 });
        
        // Test with invalid URL to simulate network error
        await expect(async () => {
            await scraper.initialize();
            const page = await scraper.createPage();
            await page.goto('http://invalid-url-for-testing.com');
        }).rejects.toThrow();
        
        await scraper.close();
    });

    test('should handle malformed Google Sheets config', () => {
        expect(() => {
            new GoogleSheetsManager({
                spreadsheetId: 'invalid-id',
                serviceAccountKey: 'invalid-json'
            });
        }).not.toThrow(); // Constructor doesn't validate JSON, validation happens during initialization
    });
});