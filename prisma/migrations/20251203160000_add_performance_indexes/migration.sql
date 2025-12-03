-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_plan_idx" ON "User"("plan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_isEmailVerified_idx" ON "User"("isEmailVerified");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analysis_userId_isDeleted_idx" ON "Analysis"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analysis_isDeleted_createdAt_idx" ON "Analysis"("isDeleted", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analysis_isNonTargetClient_idx" ON "Analysis"("isNonTargetClient");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_userId_status_createdAt_idx" ON "Payment"("userId", "status", "createdAt");

-- DropIndex (removing redundant index)
DROP INDEX IF EXISTS "Payment_paymentId_idx";
