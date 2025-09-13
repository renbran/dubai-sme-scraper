FROM apify/actor-node:20

# Install comprehensive system dependencies for Playwright browsers (Alpine Linux)
RUN apk update --no-cache \
    && apk add --no-cache \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    chromium \
    && rm -rf /var/cache/apk/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies with proper flags for production
RUN npm ci --only=production --quiet \
    && npm cache clean --force

# Copy source code
COPY . ./

# Install Playwright browsers with verification
RUN npx playwright install chromium \
    && echo "Checking browser installation..." \
    && ls -la /root/.cache/ms-playwright/ \
    && find /root/.cache/ms-playwright/ -name "*chrome*" -type f \
    && chmod -R 755 /root/.cache/ms-playwright

# Set environment variables for production
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Run the actor
CMD npm start