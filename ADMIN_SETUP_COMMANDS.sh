#!/bin/bash

echo "========================================"
echo "ADMIN PANEL SETUP - Linux/Mac"
echo "========================================"
echo ""

echo "Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Prisma generate failed!"
    exit 1
fi
echo ""

echo "Step 2: Pushing schema to database..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "ERROR: Database push failed!"
    exit 1
fi
echo ""

echo "========================================"
echo "DATABASE UPDATED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Restart your dev server: npm run dev"
echo "2. Call POST http://localhost:3000/api/admin/init"
echo "3. Login as kosobokov90@yandex.ru"
echo "4. Go to http://localhost:3000/admin"
echo "5. DELETE app/api/admin/init/route.ts for security"
echo ""
echo "========================================"




































