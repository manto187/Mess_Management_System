@echo off
echo ========================================
echo   Backend Fix Script (Windows)
echo ========================================
echo.

echo Step 1: Cleaning old files...
if exist dist rmdir /s /q dist
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
if exist node_modules\@prisma rmdir /s /q node_modules\@prisma
if exist src\generated rmdir /s /q src\generated
echo Done!
echo.

echo Step 2: Installing Prisma Client...
call npm install @prisma/client
echo.

echo Step 3: Generating Prisma Client...
call npx prisma generate
echo.

echo Step 4: Testing database connection...
call node check-error.js
echo.

echo Step 5: Starting backend server...
echo.
echo Watch for these messages:
echo   [OK] Prisma schema loaded
echo   [OK] Generated Prisma Client
echo   [OK] Nest application successfully started
echo   [OK] Server running on http://localhost:3001/api/v1
echo.
echo If you see errors about "meal" or "MealType", press Ctrl+C and run this script again.
echo.
echo Starting now...
echo.

call npm run start:dev
