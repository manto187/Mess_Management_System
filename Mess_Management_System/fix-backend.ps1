# Complete Backend Fix Script
# This script will clean and regenerate everything

Write-Host "🔧 Starting Complete Backend Fix..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Set-Location -Path "backend"

Write-Host "Step 1: Stopping any running processes..." -ForegroundColor Yellow
# Try to kill any process on port 3001
try {
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Stopped process on port 3001" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  No process found on port 3001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Cleaning old files..." -ForegroundColor Yellow

# Remove old generated files
if (Test-Path "dist") { 
    Remove-Item -Recurse -Force "dist" 
    Write-Host "✅ Removed dist/" -ForegroundColor Green
}

if (Test-Path "node_modules\.prisma") { 
    Remove-Item -Recurse -Force "node_modules\.prisma" 
    Write-Host "✅ Removed node_modules/.prisma/" -ForegroundColor Green
}

if (Test-Path "src\generated") { 
    Remove-Item -Recurse -Force "src\generated" 
    Write-Host "✅ Removed src/generated/" -ForegroundColor Green
}

if (Test-Path "node_modules\@prisma\client") { 
    Remove-Item -Recurse -Force "node_modules\@prisma\client" 
    Write-Host "✅ Removed node_modules/@prisma/client/" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Reinstalling Prisma Client..." -ForegroundColor Yellow
npm install @prisma/client

Write-Host ""
Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "Step 5: Running diagnostic..." -ForegroundColor Yellow
node diagnose.js

Write-Host ""
Write-Host "Step 6: Starting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Watch for these messages:" -ForegroundColor Yellow
Write-Host "   ✅ 'Prisma schema loaded'" -ForegroundColor Green
Write-Host "   ✅ 'Generated Prisma Client'" -ForegroundColor Green
Write-Host "   ✅ 'Nest application successfully started'" -ForegroundColor Green
Write-Host "   ✅ '🚀 Server running on http://localhost:3001/api/v1'" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  If you see these errors, press Ctrl+C and run this script again:" -ForegroundColor Red
Write-Host "   ❌ 'Property meal does not exist'" -ForegroundColor Red
Write-Host "   ❌ 'MealType not found'" -ForegroundColor Red
Write-Host ""
Write-Host "Starting server now..." -ForegroundColor Cyan
Write-Host ""

npm run start:dev
