# VPS Setup Guide for Dubai SME Scraper

## What is a VPS?

A **Virtual Private Server (VPS)** is your own virtual computer in the cloud that runs 24/7. Think of it as renting a dedicated slice of a powerful server.

### VPS vs Other Options:
| Option | Cost/Month | Control | Complexity | Best For |
|--------|------------|---------|------------|----------|
| **Shared Hosting** | $3-10 | Low | Easy | Simple websites |
| **VPS** | $5-20 | High | Medium | Your scraper! |
| **Cloud Functions** | $10-50 | Medium | Medium | Apify, AWS Lambda |
| **Dedicated Server** | $50-200 | Highest | Hard | Large enterprises |

## 🏆 Recommended VPS Providers

### 1. **DigitalOcean** (Recommended for beginners)
- **Cost**: $6/month for 1GB RAM, 1 CPU
- **Pros**: Simple interface, great documentation, $200 free credit
- **Cons**: Slightly more expensive
- **Best for**: First-time VPS users

### 2. **Vultr** (Best performance/price)
- **Cost**: $6/month for 1GB RAM, 1 CPU  
- **Pros**: Fast SSD, global locations, excellent performance
- **Cons**: Interface less beginner-friendly
- **Best for**: Performance-focused users

### 3. **Linode** (Most reliable)
- **Cost**: $5/month for 1GB RAM, 1 CPU
- **Pros**: Rock-solid uptime, excellent support
- **Cons**: Fewer beginner tutorials
- **Best for**: Production reliability

### 4. **Hetzner** (Best value)
- **Cost**: €4.15/month (~$4.50) for 4GB RAM, 2 CPU
- **Pros**: Incredible value, green energy
- **Cons**: Limited to Europe locations
- **Best for**: Budget-conscious users

## 🚀 Quick VPS Setup (DigitalOcean Example)

### Step 1: Create Account
1. Go to [DigitalOcean.com](https://digitalocean.com)
2. Sign up (get $200 free credit)
3. Verify email and add payment method

### Step 2: Create Droplet (VPS)
1. Click "Create" → "Droplets"
2. **Choose Image**: Ubuntu 22.04 LTS
3. **Size**: Basic $6/month (1GB RAM, 1 CPU)
4. **Region**: Choose closest to you
5. **Authentication**: SSH Key (recommended) or Password
6. **Hostname**: dubai-scraper
7. Click "Create Droplet"

### Step 3: Connect to Your VPS
```bash
# Using SSH (replace YOUR_VPS_IP with actual IP)
ssh root@YOUR_VPS_IP

# If using password, enter it when prompted
# If using SSH key, it should connect automatically
```

### Step 4: Initial Server Setup
```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git unzip htop

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify installations
node --version  # Should show v20.x.x
npm --version   # Should show latest npm
```

## 🛠️ Deploy Your Dubai SME Scraper

### Step 1: Upload Your Code
```bash
# Clone your repository (if using GitHub)
git clone https://github.com/YOUR_USERNAME/dubai-sme-scraper.git
cd dubai-sme-scraper

# OR upload files manually using SCP
# scp -r /path/to/local/scraper root@YOUR_VPS_IP:/root/dubai-scraper
```

### Step 2: Install Dependencies
```bash
# Install Playwright and dependencies
npm install

# Install system dependencies for browsers
apt install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2

# Install Playwright browsers
npx playwright install chromium
npx playwright install-deps chromium
```

### Step 3: Test Your Scraper
```bash
# Run a quick test
node test-scraper.js

# If successful, you should see:
# ✅ Browser launched successfully!
# ✅ Found X businesses!
```

### Step 4: Set Up Automated Scheduling
```bash
# Create a cron job to run scraper automatically
crontab -e

# Add this line to run daily at 9 AM:
0 9 * * * cd /root/dubai-scraper && node run-production.js >> /var/log/scraper.log 2>&1

# Or run weekly on Sundays at 9 AM:
0 9 * * 0 cd /root/dubai-scraper && node run-production.js >> /var/log/scraper.log 2>&1
```

### Step 5: Monitor and Manage
```bash
# View scraper logs
tail -f /var/log/scraper.log

# Check system resources
htop

# Check disk space
df -h

# List running processes
ps aux | grep node
```

## 🔒 Security Best Practices

### 1. Create Non-Root User
```bash
# Create new user
adduser scraper
usermod -aG sudo scraper

# Switch to new user
su - scraper
```

### 2. Configure Firewall
```bash
# Enable UFW firewall
ufw enable

# Allow SSH (port 22)
ufw allow ssh

# Allow HTTP/HTTPS (if running web interface)
ufw allow 80
ufw allow 443
```

### 3. Disable Root SSH (Optional)
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change: PermitRootLogin no
# Restart SSH: systemctl restart ssh
```

## 📊 Management Scripts

### Scraper Control Script
```bash
# Create management script
nano ~/scraper-control.sh
```

Add this content:
```bash
#!/bin/bash
SCRAPER_DIR="/root/dubai-scraper"

case "$1" in
    start)
        echo "Starting scraper..."
        cd $SCRAPER_DIR && nohup node run-production.js > scraper.log 2>&1 &
        echo "Scraper started in background"
        ;;
    stop)
        echo "Stopping scraper..."
        pkill -f "node run-production.js"
        echo "Scraper stopped"
        ;;
    status)
        if pgrep -f "node run-production.js" > /dev/null; then
            echo "Scraper is running"
        else
            echo "Scraper is not running"
        fi
        ;;
    logs)
        tail -f $SCRAPER_DIR/scraper.log
        ;;
    results)
        ls -la $SCRAPER_DIR/results/
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs|results}"
        exit 1
        ;;
esac
```

Make it executable:
```bash
chmod +x ~/scraper-control.sh
```

## 💰 Cost Breakdown

### Monthly VPS Costs:
- **Basic VPS**: $5-6/month
- **Storage**: Usually included (25-50GB)
- **Bandwidth**: Usually unlimited
- **Total**: $5-6/month vs $49+/month on Apify

### What You Get:
- ✅ Full control over environment
- ✅ 24/7 automated scraping
- ✅ Custom scheduling
- ✅ Multiple output formats
- ✅ No platform limitations
- ✅ 10x cost savings

## 🆘 Troubleshooting

### Common Issues:
1. **Browser fails to launch**: Install missing dependencies
2. **Out of memory**: Upgrade to 2GB RAM VPS ($12/month)
3. **Scraper stops running**: Check logs, add monitoring
4. **Slow performance**: Choose VPS closer to Dubai

### Getting Help:
- DigitalOcean tutorials: digitalocean.com/community
- Vultr docs: vultr.com/docs
- General VPS help: Ask me! I can help debug any issues

## 🎯 Next Steps

1. **Choose a VPS provider** (I recommend DigitalOcean for beginners)
2. **Create your VPS** following the setup steps
3. **Deploy your scraper** using the deployment guide
4. **Test everything** with a small dataset
5. **Set up automation** for regular scraping
6. **Monitor and optimize** as needed

Ready to get started? I can help you with any step of the process!