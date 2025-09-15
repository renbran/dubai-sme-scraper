# DigitalOcean Setup Guide for Dubai SME Scraper

## 🚀 Why DigitalOcean is Perfect for You

✅ **$200 FREE Credit** - Covers 33+ months of scraper hosting  
✅ **Beginner-friendly** - Simple interface and great documentation  
✅ **Reliable** - 99.99% uptime guarantee  
✅ **Fast setup** - VPS ready in 55 seconds  
✅ **Global reach** - Data centers worldwide  

## 💰 Cost Breakdown

**What you'll pay:**
- **First 33 months**: FREE (using $200 credit)
- **After that**: $6/month for 1GB RAM VPS
- **Your scraper needs**: ~$6/month (well within free credit)

**Comparison:**
- DigitalOcean: $0-6/month 🎉
- Apify Platform: $49+/month 💸
- **You save**: $43+/month = $516+/year

## 📋 Step-by-Step Setup

### Step 1: Create DigitalOcean Account (5 minutes)

1. **Go to DigitalOcean**: https://digitalocean.com
2. **Click "Sign up"** 
3. **Use GitHub/Google** (recommended) or email signup
4. **Verify your email** address
5. **Add payment method** (required even for free trial)
   - Don't worry - you won't be charged with $200 credit
   - Use credit card or PayPal
6. **Get $200 free credit** automatically applied

### Step 2: Create Your First Droplet (VPS) (5 minutes)

1. **Click "Create" → "Droplets"**
2. **Choose Region**: Select closest to you:
   - If in UAE: Amsterdam or Frankfurt
   - If in US: New York or San Francisco
   - If in Asia: Singapore
3. **Choose Image**: 
   - Click "OS" tab
   - Select **"Ubuntu 22.04 (LTS) x64"** ⭐
4. **Choose Size**:
   - Select **"Basic"** plan
   - Choose **"Regular Intel"**
   - Select **$6/month** (1GB RAM, 1 vCPU, 25GB SSD)
5. **Choose Authentication**:
   - **Recommended**: SSH Keys (more secure)
   - **Easier**: Password (choose strong password)
6. **Finalize**:
   - Hostname: `dubai-scraper`
   - Click **"Create Droplet"**

### Step 3: Get Your VPS Details

After 1-2 minutes, you'll see:
- **IP Address**: Something like `142.93.123.456`
- **Username**: `root`
- **Password**: Emailed to you (if using password auth)

Write these down! ✍️

### Step 4: Connect to Your VPS

#### Option A: Using Windows PowerShell/Command Prompt
```powershell
# Replace with your actual IP address
ssh root@142.93.123.456

# Enter password when prompted
# Or use SSH key if you set one up
```

#### Option B: Using DigitalOcean Console (Backup option)
1. In DigitalOcean dashboard
2. Click your droplet name
3. Click "Console" tab
4. Login with `root` and password

### Step 5: Verify Connection

Once connected, you should see something like:
```
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-78-generic x86_64)
root@dubai-scraper:~#
```

🎉 **Success! You're now connected to your VPS!**

## 🛠️ Deploy Your Scraper (10 minutes)

### Upload Deployment Script

From your local machine (Windows):

```powershell
# Navigate to your scraper directory
cd D:\apify\apify_actor

# Upload the deployment script (replace with your IP)
scp vps-deploy.sh root@142.93.123.456:/root/

# If scp doesn't work, use the DigitalOcean Console to copy-paste
```

### Run Deployment Script

SSH into your VPS and run:

```bash
# Make script executable
chmod +x vps-deploy.sh

# Run the deployment (installs everything automatically)
./vps-deploy.sh
```

This script will automatically:
- ✅ Update Ubuntu system
- ✅ Install Node.js 20
- ✅ Install Playwright and browsers
- ✅ Set up directory structure
- ✅ Configure firewall
- ✅ Create management scripts

### Upload Your Scraper Code

From your local machine:

```powershell
# Upload your scraper files (replace with your IP)
scp src/GoogleMapsScraper.js root@142.93.123.456:/opt/dubai-scraper/src/
scp test-scraper.js root@142.93.123.456:/opt/dubai-scraper/
scp run-production.js root@142.93.123.456:/opt/dubai-scraper/
scp package.json root@142.93.123.456:/opt/dubai-scraper/
```

### Test Your Scraper

SSH into VPS and test:

```bash
# Go to scraper directory
cd /opt/dubai-scraper

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Test the scraper
./scripts/manage-scraper.sh test
```

You should see:
```
🚀 Testing Dubai SME Scraper locally...
✅ Browser launched successfully!
✅ Found X businesses!
🎉 Test completed successfully!
```

## 🎯 Start Production Scraping

### Manual Run
```bash
# Run production scraper once
./scripts/manage-scraper.sh production

# Or run directly
node run-production.js
```

### Automated Daily Scraping
```bash
# Set up daily scraping at 9 AM
./scripts/manage-scraper.sh schedule

# Check if cron job was added
crontab -l
```

### Monitor Your Scraper
```bash
# Check system status
./scripts/monitor.sh

# View recent results
./scripts/manage-scraper.sh results

# View logs
./scripts/manage-scraper.sh logs
```

## 🔧 Management Commands

```bash
# Start scraper service
./scripts/manage-scraper.sh start

# Stop scraper service  
./scripts/manage-scraper.sh stop

# View live logs
./scripts/manage-scraper.sh logs-live

# Check service status
./scripts/manage-scraper.sh status

# Run test
./scripts/manage-scraper.sh test
```

## 📊 Monitor Your Usage

### DigitalOcean Dashboard
- **Billing**: Check your $200 credit usage
- **Monitoring**: CPU, Memory, Disk usage graphs
- **Networking**: Bandwidth usage

### On Your VPS
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# View all results
ls -la /opt/dubai-scraper/results/
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. SSH Connection Failed
```bash
# Try with verbose output
ssh -v root@YOUR_IP

# Check if IP is correct in DigitalOcean dashboard
# Verify password or SSH key
```

#### 2. Browser Launch Failed
```bash
# Install additional dependencies
sudo apt update
sudo apt install -y chromium-browser

# Reinstall Playwright
npx playwright install chromium --force
```

#### 3. Permission Denied
```bash
# Fix ownership
sudo chown -R root:root /opt/dubai-scraper

# Fix permissions
sudo chmod +x /opt/dubai-scraper/scripts/*.sh
```

#### 4. Out of Memory
```bash
# Check memory usage
free -h

# If needed, resize droplet to 2GB RAM ($12/month)
# DigitalOcean Dashboard → Droplet → Resize
```

#### 5. Scraper Stops Running
```bash
# Check logs
./scripts/manage-scraper.sh logs

# Restart service
./scripts/manage-scraper.sh restart

# Check system resources
./scripts/monitor.sh
```

## 💡 Optimization Tips

### 1. Resize if Needed
- **1GB RAM**: Good for small datasets (50-100 businesses)
- **2GB RAM**: Better for large datasets (500+ businesses)
- **Resize**: DigitalOcean → Droplet → Resize

### 2. Backup Your Data
```bash
# Backup results regularly
scp -r root@YOUR_IP:/opt/dubai-scraper/results/ ./backups/

# Or set up automated backups in DigitalOcean
```

### 3. Monitor Costs
- Check billing weekly
- $200 credit = 33+ months of $6/month VPS
- Set up billing alerts

## 🎉 Success Checklist

After setup, you should have:

- ✅ **DigitalOcean account** with $200 credit
- ✅ **Ubuntu VPS** running 24/7
- ✅ **Dubai SME scraper** installed and tested
- ✅ **Daily automation** scheduled
- ✅ **Management scripts** for easy control
- ✅ **Monitoring** setup
- ✅ **Results** automatically saved

## 📞 Getting Help

### DigitalOcean Support
- **Community**: digitalocean.com/community
- **Tutorials**: digitalocean.com/community/tutorials
- **Support**: Available 24/7 via ticket system

### For Your Scraper
- Check logs: `./scripts/manage-scraper.sh logs`
- Monitor system: `./scripts/monitor.sh`
- Test functionality: `./scripts/manage-scraper.sh test`

## 🚀 Next Steps After Setup

1. **Test thoroughly** with small datasets
2. **Scale up** configuration for your needs
3. **Set up monitoring** alerts
4. **Plan data backup** strategy
5. **Optimize** scraping schedule

Your Dubai SME scraper will be running 24/7 on professional infrastructure for FREE (for the first 33+ months)! 🎉