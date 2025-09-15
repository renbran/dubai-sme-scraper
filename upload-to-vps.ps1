# Upload Dubai SME Scraper to VPS (PowerShell version)
# Run this script from your local Windows machine

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$VpsDir = "/opt/dubai-scraper"
)

# Colors for output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Status "Uploading Dubai SME Scraper to VPS: $VpsIP"

# Check if required files exist
$RequiredFiles = @(
    "src\GoogleMapsScraper.js",
    "test-scraper.js", 
    "run-production.js",
    "package.json"
)

foreach ($file in $RequiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "Required file not found: $file"
        exit 1
    }
}

Write-Success "All required files found locally"

# Check if scp is available (Windows 10/11 with OpenSSH)
try {
    scp 2>&1 | Out-Null
} catch {
    Write-Error "SCP not found. Please install OpenSSH or use WSL."
    Write-Host "To install OpenSSH on Windows:"
    Write-Host "1. Go to Settings > Apps > Optional Features"
    Write-Host "2. Add 'OpenSSH Client'"
    Write-Host "Or use Windows Subsystem for Linux (WSL)"
    exit 1
}

# Create directories on VPS
Write-Status "Creating directories on VPS..."
ssh "$VpsUser@$VpsIP" "mkdir -p $VpsDir/src"

# Upload files using SCP
Write-Status "Uploading source code..."
scp "src\GoogleMapsScraper.js" "$VpsUser@$VpsIP`:$VpsDir/src/"

Write-Status "Uploading scripts..."
scp "test-scraper.js" "$VpsUser@$VpsIP`:$VpsDir/"
scp "run-production.js" "$VpsUser@$VpsIP`:$VpsDir/"

Write-Status "Uploading package.json..."
scp "package.json" "$VpsUser@$VpsIP`:$VpsDir/"

# Set permissions
Write-Status "Setting permissions..."
ssh "$VpsUser@$VpsIP" "chmod +x $VpsDir/scripts/*.sh"

Write-Success "Upload complete!"

Write-Status "Testing scraper on VPS..."
$testResult = ssh "$VpsUser@$VpsIP" "cd $VpsDir && ./scripts/manage-scraper.sh test"

if ($LASTEXITCODE -eq 0) {
    Write-Success "🎉 Scraper is working on VPS!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. SSH to your VPS: ssh $VpsUser@$VpsIP"
    Write-Host "2. Go to scraper directory: cd $VpsDir"
    Write-Host "3. Start the service: ./scripts/manage-scraper.sh start"
    Write-Host "4. Set up scheduling: ./scripts/manage-scraper.sh schedule"
    Write-Host "5. Monitor: ./scripts/monitor.sh"
} else {
    Write-Error "Test failed. Check the logs on your VPS."
    Write-Host "SSH to your VPS and run: $VpsDir/scripts/manage-scraper.sh logs"
}

Write-Host ""
Write-Host "Example usage:"
Write-Host "  .\upload-to-vps.ps1 -VpsIP 192.168.1.100"
Write-Host "  .\upload-to-vps.ps1 -VpsIP your-server.com -VpsUser ubuntu"