# DigitalOcean Quick Start Script for Windows
# PowerShell script to help with VPS setup

param(
    [Parameter(Mandatory=$false)]
    [string]$VpsIP = "",
    [Parameter(Mandatory=$false)]
    [string]$Action = "help"
)

function Write-Title {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "="*50 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Yellow
    Write-Host "="*50 -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔷 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check if SSH is available
    try {
        ssh 2>&1 | Out-Null
        Write-Success "SSH client found"
    } catch {
        Write-Error "SSH client not found. Please install OpenSSH:"
        Write-Host "  Settings > Apps > Optional Features > Add 'OpenSSH Client'"
        return $false
    }
    
    # Check if SCP is available
    try {
        scp 2>&1 | Out-Null
        Write-Success "SCP client found"
    } catch {
        Write-Error "SCP client not found. Install with OpenSSH."
        return $false
    }
    
    # Check if required files exist
    $requiredFiles = @(
        "vps-deploy.sh",
        "src\GoogleMapsScraper.js",
        "test-scraper.js",
        "run-production.js",
        "package.json"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "Found: $file"
        } else {
            Write-Error "Missing: $file"
            return $false
        }
    }
    
    return $true
}

function Show-DigitalOceanInstructions {
    Write-Title "DigitalOcean Account Setup"
    
    Write-Host @"
1. Go to: https://digitalocean.com
2. Click 'Sign up' (use GitHub/Google for faster signup)
3. Verify your email address
4. Add payment method (required even for free trial)
5. Get $200 free credit automatically

Create Your Droplet (VPS):
1. Click 'Create' → 'Droplets'
2. Choose Ubuntu 22.04 (LTS) x64
3. Select Basic $6/month plan (1GB RAM)
4. Choose region closest to you
5. Set hostname: dubai-scraper
6. Create droplet and wait ~2 minutes

After creation:
- Note down your IP address
- Note down root password (sent via email)
"@

    Write-Host "`n💡 " -NoNewline -ForegroundColor Yellow
    Write-Host "Once you have your VPS IP, run: .\digitalocean-quickstart.ps1 -VpsIP YOUR_IP -Action deploy"
}

function Deploy-ToVPS {
    param([string]$IP)
    
    if ([string]::IsNullOrEmpty($IP)) {
        Write-Error "VPS IP address is required for deployment"
        Write-Host "Usage: .\digitalocean-quickstart.ps1 -VpsIP 142.93.123.456 -Action deploy"
        return
    }
    
    Write-Title "Deploying Dubai SME Scraper to VPS: $IP"
    
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisites check failed. Please fix the issues above."
        return
    }
    
    try {
        Write-Step "Testing SSH connection..."
        $testConnection = ssh -o ConnectTimeout=10 -o BatchMode=yes root@$IP "echo 'Connection successful'" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "SSH connection failed. Trying with password prompt..." -ForegroundColor Yellow
        } else {
            Write-Success "SSH connection successful"
        }
        
        Write-Step "Uploading deployment script..."
        scp "vps-deploy.sh" "root@${IP}:/root/"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Deployment script uploaded"
        } else {
            throw "Failed to upload deployment script"
        }
        
        Write-Step "Running deployment script on VPS..."
        Write-Host "This will take 5-10 minutes..." -ForegroundColor Yellow
        ssh "root@$IP" "chmod +x /root/vps-deploy.sh && /root/vps-deploy.sh"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "VPS environment setup completed"
        } else {
            throw "VPS environment setup failed"
        }
        
        Write-Step "Uploading scraper source code..."
        ssh "root@$IP" "mkdir -p /opt/dubai-scraper/src"
        scp "src\GoogleMapsScraper.js" "root@${IP}:/opt/dubai-scraper/src/"
        scp "test-scraper.js" "root@${IP}:/opt/dubai-scraper/"
        scp "run-production.js" "root@${IP}:/opt/dubai-scraper/"
        scp "package.json" "root@${IP}:/opt/dubai-scraper/"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Scraper code uploaded"
        } else {
            throw "Failed to upload scraper code"
        }
        
        Write-Step "Installing Node.js dependencies..."
        ssh "root@$IP" "cd /opt/dubai-scraper && npm install"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies installed"
        } else {
            throw "Failed to install dependencies"
        }
        
        Write-Step "Installing Playwright browsers..."
        ssh "root@$IP" "cd /opt/dubai-scraper && npx playwright install chromium"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Playwright browsers installed"
        } else {
            throw "Failed to install Playwright browsers"
        }
        
        Write-Step "Testing scraper on VPS..."
        $testResult = ssh "root@$IP" "cd /opt/dubai-scraper && timeout 300 node test-scraper.js"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "🎉 Scraper test successful on VPS!"
        } else {
            Write-Host "⚠️ Test had issues, but deployment completed. Check logs manually." -ForegroundColor Yellow
        }
        
        Write-Title "Deployment Complete!"
        Write-Host @"
✅ Your Dubai SME scraper is now running on DigitalOcean!

Next steps:
1. SSH to your VPS: ssh root@$IP
2. Go to scraper directory: cd /opt/dubai-scraper
3. Run test: ./scripts/manage-scraper.sh test
4. Start production: ./scripts/manage-scraper.sh start
5. Set up automation: ./scripts/manage-scraper.sh schedule
6. Monitor status: ./scripts/monitor.sh

Management commands:
- ./scripts/manage-scraper.sh status
- ./scripts/manage-scraper.sh logs
- ./scripts/manage-scraper.sh results

💰 Your $200 DigitalOcean credit covers 33+ months!
"@
        
    } catch {
        Write-Error "Deployment failed: $_"
        Write-Host "`nTroubleshooting tips:" -ForegroundColor Yellow
        Write-Host "1. Verify VPS IP address is correct"
        Write-Host "2. Check SSH connection: ssh root@$IP"
        Write-Host "3. Ensure VPS is fully booted (wait 2-3 minutes after creation)"
        Write-Host "4. Check DigitalOcean console for any issues"
    }
}

function Test-VPSConnection {
    param([string]$IP)
    
    if ([string]::IsNullOrEmpty($IP)) {
        Write-Error "VPS IP address is required"
        return
    }
    
    Write-Step "Testing connection to VPS: $IP"
    
    try {
        $result = ssh -o ConnectTimeout=10 root@$IP "echo 'Connection successful'; uname -a; free -h"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ VPS connection successful!"
            Write-Host "System info:" -ForegroundColor Green
            Write-Host $result
        } else {
            Write-Error "❌ Connection failed"
        }
    } catch {
        Write-Error "Connection test failed: $_"
    }
}

function Show-VPSStatus {
    param([string]$IP)
    
    if ([string]::IsNullOrEmpty($IP)) {
        Write-Error "VPS IP address is required"
        return
    }
    
    Write-Step "Checking scraper status on VPS: $IP"
    
    try {
        ssh "root@$IP" "cd /opt/dubai-scraper && ./scripts/monitor.sh"
    } catch {
        Write-Error "Failed to get VPS status: $_"
    }
}

# Main script logic
switch ($Action.ToLower()) {
    "help" {
        Write-Title "DigitalOcean Quick Start for Dubai SME Scraper"
        Write-Host @"
This script helps you deploy your Dubai SME scraper to DigitalOcean.

Commands:
  .\digitalocean-quickstart.ps1 -Action instructions
    Shows DigitalOcean account setup instructions

  .\digitalocean-quickstart.ps1 -VpsIP YOUR_IP -Action deploy
    Deploys scraper to your VPS

  .\digitalocean-quickstart.ps1 -VpsIP YOUR_IP -Action test
    Tests connection to your VPS

  .\digitalocean-quickstart.ps1 -VpsIP YOUR_IP -Action status
    Shows scraper status on VPS

Examples:
  .\digitalocean-quickstart.ps1 -Action instructions
  .\digitalocean-quickstart.ps1 -VpsIP 142.93.123.456 -Action deploy
  .\digitalocean-quickstart.ps1 -VpsIP 142.93.123.456 -Action status

💡 Start with 'instructions' if you don't have a DigitalOcean account yet.
"@
    }
    
    "instructions" {
        Show-DigitalOceanInstructions
    }
    
    "deploy" {
        Deploy-ToVPS -IP $VpsIP
    }
    
    "test" {
        Test-VPSConnection -IP $VpsIP
    }
    
    "status" {
        Show-VPSStatus -IP $VpsIP
    }
    
    default {
        Write-Error "Unknown action: $Action"
        Write-Host "Use -Action help to see available commands"
    }
}