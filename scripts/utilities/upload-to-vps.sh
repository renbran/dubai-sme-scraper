#!/bin/bash

# Upload Dubai SME Scraper to VPS
# Run this script from your local machine

# Configuration
VPS_IP="YOUR_VPS_IP_HERE"
VPS_USER="root"
VPS_DIR="/opt/dubai-scraper"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if VPS IP is set
if [ "$VPS_IP" = "YOUR_VPS_IP_HERE" ]; then
    print_error "Please edit this script and set your VPS_IP"
    echo "Edit the VPS_IP variable at the top of this file with your actual VPS IP address"
    exit 1
fi

print_status "Uploading Dubai SME Scraper to VPS: $VPS_IP"

# Check if required files exist
REQUIRED_FILES=(
    "src/GoogleMapsScraper.js"
    "test-scraper.js"
    "run-production.js"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

print_success "All required files found locally"

# Create source directory on VPS
print_status "Creating directories on VPS..."
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_DIR/src"

# Upload files
print_status "Uploading source code..."
scp src/GoogleMapsScraper.js $VPS_USER@$VPS_IP:$VPS_DIR/src/

print_status "Uploading scripts..."
scp test-scraper.js $VPS_USER@$VPS_IP:$VPS_DIR/
scp run-production.js $VPS_USER@$VPS_IP:$VPS_DIR/

print_status "Uploading package.json..."
scp package.json $VPS_USER@$VPS_IP:$VPS_DIR/

# Set permissions
print_status "Setting permissions..."
ssh $VPS_USER@$VPS_IP "chmod +x $VPS_DIR/scripts/*.sh"

print_success "Upload complete!"

print_status "Testing scraper on VPS..."
ssh $VPS_USER@$VPS_IP "cd $VPS_DIR && $VPS_DIR/scripts/manage-scraper.sh test"

if [ $? -eq 0 ]; then
    print_success "🎉 Scraper is working on VPS!"
    echo ""
    echo "Next steps:"
    echo "1. SSH to your VPS: ssh $VPS_USER@$VPS_IP"
    echo "2. Go to scraper directory: cd $VPS_DIR"
    echo "3. Start the service: ./scripts/manage-scraper.sh start"
    echo "4. Set up scheduling: ./scripts/manage-scraper.sh schedule"
    echo "5. Monitor: ./scripts/monitor.sh"
else
    print_error "Test failed. Check the logs on your VPS."
    echo "SSH to your VPS and run: $VPS_DIR/scripts/manage-scraper.sh logs"
fi