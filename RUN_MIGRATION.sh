#!/bin/bash

echo "=========================================="
echo "Target Proposal Database Migration"
echo "=========================================="
echo ""
echo "This will update the database schema to cache Target Proposals."
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 1: Generating Prisma client..."
npx prisma generate

echo ""
echo "Step 2: Pushing schema changes to database..."
npx prisma db push

echo ""
echo "=========================================="
echo "Migration Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart your dev server (npm run dev)"
echo "2. Open any report"
echo "3. Click 'Целевое предложение'"
echo "4. Close and reopen - should be instant!"
echo ""
read -p "Press Enter to exit..."

