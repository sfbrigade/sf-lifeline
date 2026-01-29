-- CreateTable
CREATE TABLE "RegistrationOption" (
    "id" UUID NOT NULL,
    "options" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticationOption" (
    "challenge" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthenticationOption_pkey" PRIMARY KEY ("challenge")
);

-- CreateIndex
CREATE INDEX "RegistrationOption_id_expiresAt_idx" ON "RegistrationOption"("id", "expiresAt");

-- CreateIndex
CREATE INDEX "RegistrationOption_expiresAt_idx" ON "RegistrationOption"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthenticationOption_challenge_expiresAt_idx" ON "AuthenticationOption"("challenge", "expiresAt");

-- CreateIndex
CREATE INDEX "AuthenticationOption_expiresAt_idx" ON "AuthenticationOption"("expiresAt");
