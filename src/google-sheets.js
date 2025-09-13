const { google } = require('googleapis');

const { GOOGLE_SHEETS } = require('./constants');
const { retryWithBackoff, sleep, getTimestamp } = require('./utils');

/**
 * Google Sheets Manager Class
 * Handles authentication, data writing, and sheet management for Google Sheets
 */
class GoogleSheetsManager {
    constructor(config) {
        this.config = {
            spreadsheetId: config.spreadsheetId,
            sheetName: config.sheetName || 'Dubai_SMEs',
            serviceAccountKey: config.serviceAccountKey,
            appendMode: config.appendMode || false,
            createBackup: config.createBackup !== false
        };

        this.sheets = null;
        this.auth = null;
        this.isInitialized = false;

        this.stats = {
            totalRows: 0,
            batches: 0,
            errors: 0,
            lastUpdateTime: null
        };
    }

    /**
     * Initialize Google Sheets API with authentication
     */
    async initialize() {
        console.log(`[${getTimestamp()}] Initializing Google Sheets connection...`);

        try {
            // Parse service account key
            let serviceAccountKey;
            if (typeof this.config.serviceAccountKey === 'string') {
                serviceAccountKey = JSON.parse(this.config.serviceAccountKey);
            } else {
                serviceAccountKey = this.config.serviceAccountKey;
            }

            // Create authentication
            this.auth = new google.auth.GoogleAuth({
                credentials: serviceAccountKey,
                scopes: GOOGLE_SHEETS.SCOPES
            });

            // Initialize Sheets API
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            // Test connection by getting spreadsheet info
            await this.getSpreadsheetInfo();

            this.isInitialized = true;
            console.log(`[${getTimestamp()}] Google Sheets initialized successfully`);
        } catch (error) {
            console.error(`[${getTimestamp()}] Failed to initialize Google Sheets:`, error.message);
            throw new Error(`Google Sheets initialization failed: ${error.message}`);
        }
    }

    /**
     * Get spreadsheet information
     * @returns {Object} - Spreadsheet metadata
     */
    async getSpreadsheetInfo() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const response = await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.get({
                    spreadsheetId: this.config.spreadsheetId
                });
            });

            return {
                title: response.data.properties.title,
                sheetCount: response.data.sheets.length,
                sheets: response.data.sheets.map((sheet) => ({
                    title: sheet.properties.title,
                    sheetId: sheet.properties.sheetId,
                    index: sheet.properties.index
                }))
            };
        } catch (error) {
            console.error(`[${getTimestamp()}] Error getting spreadsheet info:`, error.message);
            throw error;
        }
    }

    /**
     * Create or ensure target sheet exists
     * @returns {Object} - Sheet information
     */
    async ensureSheetExists() {
        const spreadsheetInfo = await this.getSpreadsheetInfo();
        const existingSheet = spreadsheetInfo.sheets.find((sheet) => sheet.title === this.config.sheetName);

        if (existingSheet) {
            console.log(`[${getTimestamp()}] Sheet "${this.config.sheetName}" already exists`);
            return existingSheet;
        }

        console.log(`[${getTimestamp()}] Creating new sheet: "${this.config.sheetName}"`);

        try {
            const response = await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.config.spreadsheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: this.config.sheetName,
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: GOOGLE_SHEETS.HEADERS.length
                                    }
                                }
                            }
                        }]
                    }
                });
            });

            const newSheet = response.data.replies[0].addSheet.properties;
            console.log(`[${getTimestamp()}] Created sheet with ID: ${newSheet.sheetId}`);

            return {
                title: newSheet.title,
                sheetId: newSheet.sheetId,
                index: newSheet.index
            };
        } catch (error) {
            console.error(`[${getTimestamp()}] Error creating sheet:`, error.message);
            throw error;
        }
    }

    /**
     * Create backup of existing data
     * @returns {string} - Backup sheet name
     */
    async createBackup() {
        if (!this.config.createBackup) {
            return null;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupSheetName = `${this.config.sheetName}_backup_${timestamp}`;

        console.log(`[${getTimestamp()}] Creating backup sheet: "${backupSheetName}"`);

        try {
            // Get existing data
            const existingData = await this.getSheetData(this.config.sheetName);

            if (existingData.length === 0) {
                console.log(`[${getTimestamp()}] No existing data to backup`);
                return null;
            }

            // Create backup sheet
            await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.config.spreadsheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: backupSheetName,
                                    gridProperties: {
                                        rowCount: existingData.length + 100,
                                        columnCount: GOOGLE_SHEETS.HEADERS.length
                                    }
                                }
                            }
                        }]
                    }
                });
            });

            // Copy data to backup sheet
            await this.writeData(existingData, backupSheetName, false);

            console.log(`[${getTimestamp()}] Backup created successfully: "${backupSheetName}"`);
            return backupSheetName;
        } catch (error) {
            console.warn(`[${getTimestamp()}] Failed to create backup:`, error.message);
            return null;
        }
    }

    /**
     * Get existing data from sheet
     * @param {string} sheetName - Name of the sheet
     * @returns {Array} - Existing data rows
     */
    async getSheetData(sheetName) {
        try {
            const range = `${sheetName}!A:Z`;
            const response = await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.config.spreadsheetId,
                    range
                });
            });

            return response.data.values || [];
        } catch (error) {
            if (error.code === 400) {
                // Sheet doesn't exist
                return [];
            }
            throw error;
        }
    }

    /**
     * Write business data to Google Sheets
     * @param {Array} businesses - Array of business objects
     * @param {string} sheetName - Target sheet name (optional)
     * @param {boolean} includeHeaders - Whether to include headers
     * @returns {Object} - Write operation result
     */
    async writeData(businesses, sheetName = null, includeHeaders = true) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const targetSheetName = sheetName || this.config.sheetName;
        console.log(`[${getTimestamp()}] Writing ${businesses.length} businesses to "${targetSheetName}"`);

        if (businesses.length === 0) {
            console.log(`[${getTimestamp()}] No data to write`);
            return { success: true, rowsWritten: 0 };
        }

        try {
            // Ensure sheet exists
            await this.ensureSheetExists();

            // Create backup if not in append mode
            if (!this.config.appendMode && includeHeaders) {
                await this.createBackup();
            }

            // Prepare data rows
            const dataRows = this.convertBusinessesToRows(businesses);

            // Add headers if needed
            let allRows = dataRows;
            if (includeHeaders && !this.config.appendMode) {
                allRows = [GOOGLE_SHEETS.HEADERS, ...dataRows];
            }

            // Clear sheet if not in append mode
            if (!this.config.appendMode && includeHeaders) {
                await this.clearSheet(targetSheetName);
            }

            // Write data in batches
            const result = await this.writeBatches(allRows, targetSheetName);

            this.stats.totalRows += result.rowsWritten;
            this.stats.batches += result.batches;
            this.stats.lastUpdateTime = new Date().toISOString();

            console.log(`[${getTimestamp()}] Successfully wrote ${result.rowsWritten} rows in ${result.batches} batches`);

            return result;
        } catch (error) {
            this.stats.errors++;
            console.error(`[${getTimestamp()}] Error writing to Google Sheets:`, error.message);
            throw error;
        }
    }

    /**
     * Convert business objects to row arrays
     * @param {Array} businesses - Business objects
     * @returns {Array} - Array of row arrays
     */
    convertBusinessesToRows(businesses) {
        return businesses.map((business) => [
            business.businessName || '',
            business.category || '',
            business.address || '',
            business.phone || '',
            business.website || '',
            business.email || '',
            (business.additionalEmails && business.additionalEmails.length > 0) ? business.additionalEmails.join('; ') : '',
            (business.contactPersons && business.contactPersons.length > 0) ? business.contactPersons.join('; ') : '',
            business.businessOwner || '',
            business.address || '', // Keep full address for backward compatibility
            business.locationDetails?.area || '',
            business.locationDetails?.emirate || '',
            business.locationDetails?.buildingNumber || '',
            business.locationDetails?.floor || '',
            business.locationDetails?.office || '',
            business.rating || '',
            business.reviewCount || '',
            this.formatBusinessHours(business.businessHours),
            business.coordinates?.lat || '',
            business.coordinates?.lng || '',
            business.googleMapsUrl || '',
            business.primaryPhoto || '',
            business.description || '',
            business.priceRange || '',
            business.lastUpdated || '',
            business.dataQualityScore || '',
            business.verificationStatus || ''
        ]);
    }

    /**
     * Format business hours for sheet display
     * @param {Object} hours - Business hours object
     * @returns {string} - Formatted hours string
     */
    formatBusinessHours(hours) {
        if (!hours || typeof hours !== 'object') {
            return '';
        }

        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const formattedHours = daysOrder
            .filter((day) => hours[day])
            .map((day) => `${day}: ${hours[day]}`)
            .join('; ');

        return formattedHours;
    }

    /**
     * Clear all data from a sheet
     * @param {string} sheetName - Sheet to clear
     */
    async clearSheet(sheetName) {
        console.log(`[${getTimestamp()}] Clearing sheet: "${sheetName}"`);

        try {
            await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.values.clear({
                    spreadsheetId: this.config.spreadsheetId,
                    range: `${sheetName}!A:Z`
                });
            });
        } catch (error) {
            console.error(`[${getTimestamp()}] Error clearing sheet:`, error.message);
            throw error;
        }
    }

    /**
     * Write data in batches to avoid API limits
     * @param {Array} rows - Data rows to write
     * @param {string} sheetName - Target sheet name
     * @returns {Object} - Batch write result
     */
    async writeBatches(rows, sheetName) {
        const batchSize = GOOGLE_SHEETS.BATCH_SIZE;
        let totalRowsWritten = 0;
        let batchCount = 0;

        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const startRow = i + 1;
            const endRow = startRow + batch.length - 1;
            const range = `${sheetName}!A${startRow}:${this.getColumnLetter(GOOGLE_SHEETS.HEADERS.length)}${endRow}`;

            console.log(`[${getTimestamp()}] Writing batch ${batchCount + 1}: rows ${startRow}-${endRow}`);

            try {
                await retryWithBackoff(async () => {
                    return await this.sheets.spreadsheets.values.update({
                        spreadsheetId: this.config.spreadsheetId,
                        range,
                        valueInputOption: 'RAW',
                        resource: {
                            values: batch
                        }
                    });
                });

                totalRowsWritten += batch.length;
                batchCount++;

                // Rate limiting delay
                if (i + batchSize < rows.length) {
                    await sleep(GOOGLE_SHEETS.RATE_LIMIT_DELAY);
                }
            } catch (error) {
                console.error(`[${getTimestamp()}] Error writing batch ${batchCount + 1}:`, error.message);
                throw error;
            }
        }

        return {
            success: true,
            rowsWritten: totalRowsWritten,
            batches: batchCount
        };
    }

    /**
     * Convert column number to letter (A, B, C, ... Z, AA, AB, ...)
     * @param {number} columnNumber - Column number (1-based)
     * @returns {string} - Column letter
     */
    getColumnLetter(columnNumber) {
        let result = '';
        while (columnNumber > 0) {
            columnNumber--;
            result = String.fromCharCode(65 + (columnNumber % 26)) + result;
            columnNumber = Math.floor(columnNumber / 26);
        }
        return result;
    }

    /**
     * Format sheet with headers and styling
     * @param {string} sheetName - Sheet to format
     */
    async formatSheet(sheetName) {
        console.log(`[${getTimestamp()}] Formatting sheet: "${sheetName}"`);

        try {
            const spreadsheetInfo = await this.getSpreadsheetInfo();
            const sheet = spreadsheetInfo.sheets.find((s) => s.title === sheetName);

            if (!sheet) {
                console.warn(`[${getTimestamp()}] Sheet "${sheetName}" not found for formatting`);
                return;
            }

            const requests = [
                // Format header row
                {
                    repeatCell: {
                        range: {
                            sheetId: sheet.sheetId,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: GOOGLE_SHEETS.HEADERS.length
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                                textFormat: {
                                    foregroundColor: { red: 1, green: 1, blue: 1 },
                                    bold: true
                                }
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat)'
                    }
                },
                // Freeze header row
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId: sheet.sheetId,
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        },
                        fields: 'gridProperties.frozenRowCount'
                    }
                },
                // Auto-resize columns
                {
                    autoResizeDimensions: {
                        dimensions: {
                            sheetId: sheet.sheetId,
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: GOOGLE_SHEETS.HEADERS.length
                        }
                    }
                }
            ];

            await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.config.spreadsheetId,
                    resource: { requests }
                });
            });

            console.log(`[${getTimestamp()}] Sheet formatting completed`);
        } catch (error) {
            console.warn(`[${getTimestamp()}] Error formatting sheet:`, error.message);
            // Don't throw error for formatting issues
        }
    }

    /**
     * Get operation statistics
     * @returns {Object} - Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            config: {
                spreadsheetId: this.config.spreadsheetId,
                sheetName: this.config.sheetName,
                appendMode: this.config.appendMode
            }
        };
    }

    /**
     * Test the connection and permissions
     * @returns {Object} - Test result
     */
    async testConnection() {
        console.log(`[${getTimestamp()}] Testing Google Sheets connection...`);

        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const info = await this.getSpreadsheetInfo();

            // Try to write a test row
            const testData = [['Test', 'Connection', new Date().toISOString()]];
            const testSheetName = `${this.config.sheetName}_test`;

            // Create test sheet
            await retryWithBackoff(async () => {
                return await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.config.spreadsheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: testSheetName,
                                    gridProperties: { rowCount: 10, columnCount: 10 }
                                }
                            }
                        }]
                    }
                });
            });

            // Write test data
            await this.writeBatches(testData, testSheetName);

            // Delete test sheet
            const testSheetInfo = await this.getSpreadsheetInfo();
            const testSheet = testSheetInfo.sheets.find((s) => s.title === testSheetName);

            if (testSheet) {
                await retryWithBackoff(async () => {
                    return await this.sheets.spreadsheets.batchUpdate({
                        spreadsheetId: this.config.spreadsheetId,
                        resource: {
                            requests: [{
                                deleteSheet: {
                                    sheetId: testSheet.sheetId
                                }
                            }]
                        }
                    });
                });
            }

            console.log(`[${getTimestamp()}] Google Sheets connection test successful`);

            return {
                success: true,
                spreadsheetTitle: info.title,
                sheetCount: info.sheetCount,
                permissions: 'Read/Write'
            };
        } catch (error) {
            console.error(`[${getTimestamp()}] Google Sheets connection test failed:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = GoogleSheetsManager;
