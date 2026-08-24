#!/bin/bash

# Backend Restart Script
# This script cleans and restarts the backend with fresh Prisma client

echo "🔄 Stopping any running processes..."
# Kill any existing node processes on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "📁 Navigating to backend directory..."
cd backend

echo "🧹 Cleaning old generated files..."
rm -rf dist
rm -rf node_modules/.prisma
rm -rf src/generated

echo "⚙️  Regenerating Prisma Client..."
npm run prisma:generate

echo "🚀 Starting backend server..."
npm run start:dev
