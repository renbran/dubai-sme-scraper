# Self-Hosting Dubai SME Scraper

## 🚀 Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Run locally (bypasses Apify platform)
node local-run.js
```

### Local Configuration
Edit `local-run.js` to customize:
- Categories to scrape
- Number of results per category
- Concurrency settings
- Output format

## ☁️ Cloud Hosting Options

### 1. **VPS Deployment (Recommended)**

#### DigitalOcean Droplet ($5-20/month)
```bash
# Create Ubuntu 22.04 droplet
# SSH into your droplet

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies for Playwright
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libasound2

# Clone your repo
git clone https://github.com/renbran/dubai-sme-scraper.git
cd dubai-sme-scraper

# Install and run
npm install
npx playwright install chromium
node local-run.js
```

#### AWS EC2 (t3.small ~$15/month)
```bash
# Similar setup but with AWS infrastructure
# Use Ubuntu AMI
# Configure security groups for SSH access
```

### 2. **Docker Self-Hosting**

#### Using our existing Dockerfile (fixed for Ubuntu)
```dockerfile
# Create Dockerfile.ubuntu
FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . ./
RUN npx playwright install chromium

ENV NODE_ENV=production
CMD ["node", "local-run.js"]
```

#### Deploy with Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  dubai-scraper:
    build: 
      context: .
      dockerfile: Dockerfile.ubuntu
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./results:/app/results
    mem_limit: 2g
    cpus: 1.0
```

### 3. **Serverless Options**

#### AWS Lambda (Pay per execution)
- Package as Lambda layer
- Use headless browsers
- Trigger via EventBridge/CloudWatch

#### Google Cloud Run (Pay per request)
- Container-based deployment
- Auto-scaling
- Built-in HTTPS

## 🔧 Production Setup

### Scheduled Execution
```bash
# Add to crontab for daily execution
0 2 * * * cd /path/to/dubai-scraper && node local-run.js >> logs/scraper.log 2>&1
```

### Process Management (PM2)
```bash
npm install -g pm2

# Create ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dubai-scraper',
    script: 'local-run.js',
    cron_restart: '0 2 * * *',  # Daily at 2 AM
    autorestart: false,
    max_memory_restart: '1G'
  }]
};

pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Auto-start on boot
```

## 💰 Cost Comparison

| Option | Monthly Cost | Pros | Cons |
|--------|--------------|------|------|
| **Local Machine** | $0 | Free, full control | Requires your computer running |
| **DigitalOcean VPS** | $5-20 | Reliable, always on | Manual setup |
| **AWS EC2** | $10-30 | Enterprise grade | More complex |
| **Google Cloud Run** | $5-15 | Serverless, auto-scale | Cold starts |
| **Apify Platform** | $49+/month | Managed, UI | Expensive, limitations |

## 🎯 Recommended Approach

**For Testing**: Start with local execution
**For Production**: DigitalOcean VPS ($10/month) with PM2

This gives you:
- ✅ Full control over environment
- ✅ No browser compatibility issues  
- ✅ 10x cheaper than Apify
- ✅ Reliable daily execution
- ✅ Custom data storage/processing