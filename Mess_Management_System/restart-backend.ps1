# Backend Restart Script for Windows PowerShell
# This script cleans and restarts the backend with fresh Prisma client

Write-Host "🔄 Cleaning old generated files..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location -Path "backend"

# Remove old generated files
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules\.prisma") { Remove-Item -Recurse -Force "node_modules\.prisma" }
if (Test-Path "src\generated") { Remove-Item -Recurse -Force "src\generated" }

Write-Host "⚙️  Regenerating Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
npm run start:dev
