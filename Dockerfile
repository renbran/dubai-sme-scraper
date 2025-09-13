FROM apify/actor-node:20

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies with proper flags for production
RUN npm ci --only=production --quiet \
    && npm cache clean --force

# Install Playwright browsers with retry logic
RUN npx playwright install --with-deps chromium || \
    (sleep 5 && npx playwright install --with-deps chromium) || \
    (sleep 10 && npx playwright install chromium)

# Copy source code
COPY . ./

# Set environment variables for production
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Run the actor
CMD npm start