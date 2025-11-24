#!/bin/bash

# Dubai SME Scraper VPS Deployment Script
# Run this script on your VPS after initial setup

set -e  # Exit on any error

echo "🚀 Starting Dubai SME Scraper VPS Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_status "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_success "System updated successfully"

print_status "Step 2: Installing essential tools..."
apt install -y curl wget git unzip htop nano ufw
print_success "Essential tools installed"

print_status "Step 3: Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

print_status "Step 4: Installing Playwright system dependencies..."
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
    libasound2 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0
print_success "Playwright dependencies installed"

print_status "Step 5: Setting up firewall..."
ufw --force enable
ufw allow ssh
ufw allow 22
print_success "Firewall configured"

print_status "Step 6: Creating scraper directory..."
SCRAPER_DIR="/opt/dubai-scraper"
mkdir -p $SCRAPER_DIR
cd $SCRAPER_DIR
print_success "Scraper directory created: $SCRAPER_DIR"

print_status "Step 7: Creating deployment structure..."
mkdir -p logs results data scripts
print_success "Directory structure created"

print_status "Step 8: Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "dubai-sme-scraper-vps",
  "version": "1.0.0",
  "description": "Dubai SME business data scraper for VPS deployment",
  "main": "index.js",
  "scripts": {
    "start": "node src/main.js",
    "test": "node test-scraper.js",
    "production": "node run-production.js",
    "setup": "npm install && npx playwright install chromium"
  },
  "dependencies": {
    "playwright": "^1.45.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
print_success "package.json created"

print_status "Step 9: Installing npm dependencies..."
npm install
print_success "Dependencies installed"

print_status "Step 10: Installing Playwright browsers..."
npx playwright install chromium
npx playwright install-deps chromium
print_success "Playwright browsers installed"

print_status "Step 11: Creating systemd service..."
cat > /etc/systemd/system/dubai-scraper.service << EOF
[Unit]
Description=Dubai SME Scraper Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SCRAPER_DIR
ExecStart=/usr/bin/node run-production.js
Restart=on-failure
RestartSec=10
StandardOutput=append:$SCRAPER_DIR/logs/service.log
StandardError=append:$SCRAPER_DIR/logs/error.log
Environment=NODE_ENV=production
Environment=PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
print_success "Systemd service created"

print_status "Step 12: Creating management script..."
cat > scripts/manage-scraper.sh << 'EOF'
#!/bin/bash

# Dubai SME Scraper Management Script

SCRAPER_DIR="/opt/dubai-scraper"
SERVICE_NAME="dubai-scraper"

case "$1" in
    start)
        echo "Starting Dubai SME Scraper service..."
        systemctl start $SERVICE_NAME
        systemctl enable $SERVICE_NAME
        echo "Service started and enabled"
        ;;
    stop)
        echo "Stopping Dubai SME Scraper service..."
        systemctl stop $SERVICE_NAME
        echo "Service stopped"
        ;;
    restart)
        echo "Restarting Dubai SME Scraper service..."
        systemctl restart $SERVICE_NAME
        echo "Service restarted"
        ;;
    status)
        systemctl status $SERVICE_NAME
        ;;
    logs)
        echo "Recent service logs:"
        journalctl -u $SERVICE_NAME -n 50 --no-pager
        ;;
    logs-live)
        echo "Live service logs (Ctrl+C to exit):"
        journalctl -u $SERVICE_NAME -f
        ;;
    results)
        echo "Recent scraping results:"
        ls -la $SCRAPER_DIR/results/ | tail -10
        ;;
    test)
        echo "Running test scraper..."
        cd $SCRAPER_DIR && node test-scraper.js
        ;;
    update)
        echo "Updating scraper code..."
        cd $SCRAPER_DIR && git pull origin main
        systemctl restart $SERVICE_NAME
        echo "Code updated and service restarted"
        ;;
    schedule)
        echo "Setting up cron job for daily scraping at 9 AM..."
        (crontab -l 2>/dev/null; echo "0 9 * * * cd $SCRAPER_DIR && node run-production.js >> logs/cron.log 2>&1") | crontab -
        echo "Cron job added. Run 'crontab -l' to verify."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|logs-live|results|test|update|schedule}"
        echo ""
        echo "Commands:"
        echo "  start      - Start the scraper service"
        echo "  stop       - Stop the scraper service"
        echo "  restart    - Restart the scraper service"
        echo "  status     - Show service status"
        echo "  logs       - Show recent logs"
        echo "  logs-live  - Show live logs"
        echo "  results    - List recent results"
        echo "  test       - Run test scraper"
        echo "  update     - Update code from git and restart"
        echo "  schedule   - Setup daily cron job"
        exit 1
        ;;
esac
EOF

chmod +x scripts/manage-scraper.sh
print_success "Management script created"

print_status "Step 13: Creating monitoring script..."
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# System monitoring for Dubai SME Scraper

echo "=== Dubai SME Scraper VPS Status ==="
echo "Date: $(date)"
echo ""

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print "  " $2 " " $3 " " $4 " " $5}'

echo "Memory Usage:"
free -h | grep "Mem:" | awk '{print "  Used: " $3 " / " $2 " (" $3/$2*100 "%)"}'

echo "Disk Usage:"
df -h / | tail -1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'

echo ""
echo "=== Scraper Service ==="
if systemctl is-active --quiet dubai-scraper; then
    echo "  Status: RUNNING ✅"
else
    echo "  Status: STOPPED ❌"
fi

echo ""
echo "=== Recent Results ==="
RESULTS_DIR="/opt/dubai-scraper/results"
if [ -d "$RESULTS_DIR" ]; then
    RECENT_FILE=$(ls -t $RESULTS_DIR/*.json 2>/dev/null | head -1)
    if [ -n "$RECENT_FILE" ]; then
        echo "  Latest: $(basename $RECENT_FILE)"
        echo "  Size: $(du -h $RECENT_FILE | cut -f1)"
        echo "  Modified: $(stat -c %y $RECENT_FILE)"
        
        # Count businesses in latest file
        if command -v jq &> /dev/null; then
            BUSINESS_COUNT=$(jq length $RECENT_FILE 2>/dev/null || echo "N/A")
            echo "  Businesses: $BUSINESS_COUNT"
        fi
    else
        echo "  No results found"
    fi
else
    echo "  Results directory not found"
fi

echo ""
echo "=== Log Summary ==="
LOG_FILE="/opt/dubai-scraper/logs/service.log"
if [ -f "$LOG_FILE" ]; then
    echo "  Log size: $(du -h $LOG_FILE | cut -f1)"
    echo "  Last 3 entries:"
    tail -3 $LOG_FILE | sed 's/^/    /'
else
    echo "  No log file found"
fi
EOF

chmod +x scripts/monitor.sh
print_success "Monitoring script created"

print_status "Step 14: Creating README for VPS..."
cat > README-VPS.md << 'EOF'
# Dubai SME Scraper - VPS Deployment

This directory contains your Dubai SME scraper deployed on a VPS.

## Quick Commands

```bash
# Start the scraper service
./scripts/manage-scraper.sh start

# Check status
./scripts/manage-scraper.sh status

# View logs
./scripts/manage-scraper.sh logs

# Run a test
./scripts/manage-scraper.sh test

# View system status
./scripts/monitor.sh
```

## Directory Structure

```
/opt/dubai-scraper/
├── src/                 # Source code
├── results/             # Scraping results (JSON/CSV)
├── logs/                # Service and error logs
├── scripts/             # Management scripts
├── run-production.js    # Production scraper
├── test-scraper.js      # Test scraper
└── package.json         # Dependencies
```

## Files to Upload

You need to upload these files from your local development:
- `src/GoogleMapsScraper.js`
- `test-scraper.js` 
- `run-production.js`

## Next Steps

1. Upload your scraper source code to the `src/` directory
2. Upload your test and production scripts
3. Run `./scripts/manage-scraper.sh test` to verify everything works
4. Set up automated scheduling with `./scripts/manage-scraper.sh schedule`
5. Monitor with `./scripts/monitor.sh`

## Troubleshooting

- **Service won't start**: Check logs with `./scripts/manage-scraper.sh logs`
- **Browser issues**: Run `npx playwright install chromium`
- **Permission errors**: Ensure files are owned by root
- **Out of memory**: Upgrade to 2GB RAM VPS

For support, check the logs and monitoring output.
EOF
print_success "VPS README created"

print_success "🎉 VPS deployment setup complete!"
echo ""
echo "================================================"
echo "Next Steps:"
echo "1. Upload your scraper files to: $SCRAPER_DIR"
echo "2. Test with: ./scripts/manage-scraper.sh test"
echo "3. Start service: ./scripts/manage-scraper.sh start"
echo "4. Monitor with: ./scripts/monitor.sh"
echo ""
echo "Management script: ./scripts/manage-scraper.sh"
echo "Monitoring script: ./scripts/monitor.sh"
echo ""
print_success "Your Dubai SME scraper is ready for production!"