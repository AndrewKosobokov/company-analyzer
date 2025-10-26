-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "organizationName" TEXT,
    "inn" TEXT,
    "phone" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "analysesRemaining" INTEGER NOT NULL DEFAULT 5,
    "planStartDate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'user',
    "requestsLimit" INTEGER NOT NULL DEFAULT 50,
    "requestsUsed" INTEGER NOT NULL DEFAULT 0,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyInn" TEXT NOT NULL,
    "reportText" TEXT NOT NULL,
    "targetProposal" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isNonTarget" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
