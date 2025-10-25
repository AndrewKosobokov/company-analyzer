@echo off
echo ========================================
echo ADMIN PANEL SETUP - Windows
echo ========================================
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Pushing schema to database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Database push failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo DATABASE UPDATED SUCCESSFULLY!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Restart your dev server: npm run dev
echo 2. Call POST http://localhost:3000/api/admin/init
echo 3. Login as kosobokov90@yandex.ru
echo 4. Go to http://localhost:3000/admin
echo 5. DELETE app/api/admin/init/route.ts for security
echo.
echo ========================================
pause
















