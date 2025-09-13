FROM apify/actor-node:16

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=prod --quiet

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Copy source code
COPY . ./

# Set environment variables
ENV NODE_ENV=production
ENV APIFY_HEADLESS=1
ENV APIFY_MEMORY_MBYTES=4096

# Expose port (optional, for debugging)
EXPOSE 3000

# Run the actor
CMD npm start