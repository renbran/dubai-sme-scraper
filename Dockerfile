FROM apify/actor-node:20

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies with proper flags for production
RUN npm ci --only=production --quiet \
    && npm cache clean --force

# Copy source code
COPY . ./

# Install Playwright browsers using the installed playwright package
RUN npx playwright install chromium \
    && npx playwright install-deps

# Set environment variables for production
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096

# Run the actor
CMD npm start