# Contributing to Dubai SME Scraper

Thank you for your interest in contributing to the Dubai SME Scraper! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### Prerequisites

- Node.js 16+ with npm
- Git installed and configured
- Basic knowledge of JavaScript/Node.js
- Understanding of web scraping concepts (helpful but not required)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/dubai-sme-scraper.git
   cd dubai-sme-scraper
   ```

2. **Install Dependencies**
   ```bash
   npm install
   npx playwright install chromium
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Contributing Guidelines

### Code Style

- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for new functions
- Maintain consistent indentation (2 spaces)

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(scraper): add email extraction functionality
fix(sheets): resolve authentication timeout issue
docs(readme): update configuration examples
test(utils): add tests for contact extraction
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Changes**
   ```bash
   npm run lint
   npm test
   npm run test:integration
   ```

4. **Submit Pull Request**
   - Fill out the PR template completely
   - Link related issues
   - Request review from maintainers

### Testing Requirements

- All new features must include unit tests
- Integration tests for major functionality
- Maintain or improve test coverage
- Tests should pass in CI/CD pipeline

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, Actor version
- **Input Configuration**: The configuration that caused the issue
- **Expected vs Actual Behavior**: Clear description of what went wrong
- **Error Messages**: Full error logs and stack traces
- **Steps to Reproduce**: Detailed reproduction steps

Use the Bug Report template when creating issues.

## ✨ Feature Requests

Before requesting features:

- Check existing issues and discussions
- Consider if it fits the project scope
- Think about implementation complexity
- Provide clear use cases and examples

Use the Feature Request template when creating issues.

## 🔧 Development Guidelines

### Project Structure

```
apify_actor/
├── src/                 # Source code
│   ├── main.js         # Main entry point
│   ├── scraper.js      # Scraping logic
│   ├── google-sheets.js # Google Sheets integration
│   ├── utils.js        # Utility functions
│   └── constants.js    # Configuration constants
├── test/               # Test files
├── .actor/             # Apify configuration
├── docs/               # Documentation
└── .github/            # GitHub templates and workflows
```

### Key Components

#### Scraper Engine (`src/scraper.js`)
- Handles browser automation with Playwright
- Implements advanced clicking strategies
- Manages memory and performance optimization
- Provides error recovery mechanisms

#### Contact Extractor (`src/utils.js`)
- Extracts emails using regex patterns
- Identifies contact persons and roles
- Parses UAE-specific location data
- Provides data validation utilities

#### Google Sheets Client (`src/google-sheets.js`)
- Manages Google Sheets API authentication
- Handles batch operations for performance
- Provides error handling and retry logic
- Supports multiple export formats

#### Quality Controller (`src/utils.js`)
- Implements multi-criteria scoring system
- Filters businesses based on quality thresholds
- Provides duplicate detection algorithms
- Validates and cleans extracted data

### Code Standards

#### JavaScript Style

```javascript
// Good: Use meaningful names
const extractedBusinesses = await scraper.extractBusinessData(category);

// Good: Add JSDoc comments
/**
 * Extracts email addresses from text using multiple regex patterns
 * @param {string} text - Text to search for emails
 * @returns {string[]} Array of unique email addresses
 */
function extractEmailsFromText(text) {
    // Implementation
}

// Good: Use async/await for promises
async function processBusinessData(business) {
    try {
        const enhancedData = await enhanceContactInfo(business);
        return enhancedData;
    } catch (error) {
        console.error('Error processing business:', error);
        throw error;
    }
}
```

#### Error Handling

```javascript
// Good: Comprehensive error handling
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    console.error(`Operation failed: ${error.message}`);
    
    // Re-throw with context
    throw new Error(`Failed to process data: ${error.message}`);
}

// Good: Graceful degradation
function extractOptionalData(element) {
    try {
        return element.textContent.trim();
    } catch (error) {
        console.warn('Failed to extract optional data:', error.message);
        return null; // Graceful fallback
    }
}
```

#### Testing Patterns

```javascript
// Good: Descriptive test names
describe('Email Extraction Utilities', () => {
    test('should extract valid UAE email addresses', async () => {
        const text = 'Contact us at info@emirates.ae or sales@company.com';
        const emails = extractEmailsFromText(text);
        
        expect(emails).toContain('info@emirates.ae');
        expect(emails).toContain('sales@company.com');
        expect(emails).toHaveLength(2);
    });

    test('should handle text without emails gracefully', async () => {
        const text = 'No emails in this text';
        const emails = extractEmailsFromText(text);
        
        expect(emails).toEqual([]);
    });
});
```

### Performance Considerations

- **Memory Management**: Use `global.gc()` for large operations
- **Rate Limiting**: Respect Google's terms with appropriate delays
- **Batch Operations**: Group API calls for efficiency
- **Error Recovery**: Implement exponential backoff for retries

### Security Guidelines

- Never commit sensitive data (API keys, credentials)
- Use environment variables for configuration
- Validate all user inputs
- Sanitize data before storage
- Follow principle of least privilege

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:live          # Live scraping tests

# With coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Categories

#### Unit Tests
- Test individual functions in isolation
- Mock external dependencies
- Fast execution (< 1 second per test)
- No network calls or file I/O

#### Integration Tests
- Test component interactions
- Use real dependencies where possible
- May require network access
- Test configuration and setup

#### Live Tests
- Test against real Google Maps data
- Require internet connection
- Use for validation and debugging
- Run sparingly to avoid rate limiting

### Writing Tests

#### Test Structure
```javascript
describe('Component Name', () => {
    beforeEach(() => {
        // Setup before each test
    });

    afterEach(() => {
        // Cleanup after each test
    });

    test('should do something specific', async () => {
        // Arrange
        const input = createTestInput();
        
        // Act
        const result = await functionUnderTest(input);
        
        // Assert
        expect(result).toEqual(expectedOutput);
    });
});
```

#### Mocking External Services
```javascript
// Mock Google Sheets API
jest.mock('../src/google-sheets.js', () => ({
    GoogleSheetsClient: jest.fn().mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(true),
        writeData: jest.fn().mockResolvedValue({ success: true })
    }))
}));
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and return values
- Provide usage examples for complex functions
- Document error conditions and exceptions

### User Documentation

- Update README.md for new features
- Add configuration examples
- Include troubleshooting information
- Provide migration guides for breaking changes

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create GitHub release
4. Deploy to Apify platform
5. Announce to community

## 🤝 Community

### Getting Help

- Check existing documentation first
- Search closed issues for solutions
- Ask questions in GitHub Discussions
- Contact maintainers for complex issues

### Code Review Process

- All changes require review from maintainers
- Address feedback promptly and professionally
- Be open to suggestions and improvements
- Help review others' contributions

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Documentation credits
- Community showcase

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Dubai SME Scraper! Your efforts help make web scraping more accessible and reliable for the business community.