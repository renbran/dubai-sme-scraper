FROM apify/actor-node:20

# Install minimal system dependencies for Playwright browsers (Alpine Linux)
RUN apk update --no-cache \
    && apk add --no-cache \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

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