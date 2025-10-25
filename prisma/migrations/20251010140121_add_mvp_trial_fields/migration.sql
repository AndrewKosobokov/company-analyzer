-- AlterTable
ALTER TABLE "User" ADD COLUMN     "analysesRemaining" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'trial',
ADD COLUMN     "planStartDate" TIMESTAMP(3);
