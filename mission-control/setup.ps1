# Mission Control - Setup Script
# Run this script to set up your development environment

Write-Host "🚀 Mission Control Setup" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install Convex dependencies
Write-Host "`nInstalling Convex dependencies..." -ForegroundColor Yellow
Set-Location ../convex
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Convex dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Convex dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Create .env file if it doesn't exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    
    # Generate encryption key
    $encryptionKey = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    
    # Update .env with generated key
    (Get-Content "backend/.env") -replace 'your-64-character-hex-key-here', $encryptionKey | Set-Content "backend/.env"
    
    Write-Host "✓ .env file created with encryption key" -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: Edit backend/.env and add your Convex URL" -ForegroundColor Yellow
} else {
    Write-Host "`n✓ .env file already exists" -ForegroundColor Green
}

# Create logs directory
if (-not (Test-Path "backend/logs")) {
    New-Item -ItemType Directory -Path "backend/logs" | Out-Null
    Write-Host "✓ Logs directory created" -ForegroundColor Green
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Create a Convex account at https://convex.dev" -ForegroundColor White
Write-Host "2. Run 'cd convex && npx convex dev' to setup Convex" -ForegroundColor White
Write-Host "3. Copy the Convex URL to backend/.env" -ForegroundColor White
Write-Host "4. Get API keys for testing (optional)" -ForegroundColor White
Write-Host "5. Run 'cd backend && npm run dev' to start the server`n" -ForegroundColor White
