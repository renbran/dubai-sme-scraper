FROM apify/actor-node:20

# Install system dependencies for Playwright browsers with optimized settings
RUN apt-get update -o Acquire::Retries=3 -o Acquire::http::Timeout="30" --fix-missing \
    && apt-get install -y --no-install-recommends \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies with proper flags for production
RUN npm ci --only=production --quiet \
    && npm cache clean --force

# Copy source code
COPY . ./

# Install Playwright browsers with timeout and retry logic
RUN timeout 300 npx playwright install chromium --with-deps || \
    (echo "First attempt failed, retrying..." && sleep 5 && npx playwright install chromium) \
    && chmod -R 755 /root/.cache/ms-playwright \
    && ls -la /root/.cache/ms-playwright/ || echo "Browser directory check failed"

# Set environment variables for production
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# Run the actor
CMD npm start