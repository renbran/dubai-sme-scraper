FROM apify/actor-node:20

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies with proper flags for production
RUN npm ci --only=production --quiet \
    && npm cache clean --force

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libxss1 \
    libasound2 \
    libxrandr2 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers with system dependencies
RUN npx playwright install-deps chromium \
    && npx playwright install chromium \
    && npx playwright install chromium --force

# Copy source code
COPY . ./

# Set environment variables for production
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Run the actor
CMD npm start