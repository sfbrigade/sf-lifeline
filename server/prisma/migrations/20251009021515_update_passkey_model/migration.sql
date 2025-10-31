-- CreateTable
CREATE TABLE "Passkey" (
    "id" TEXT NOT NULL,
    "credPublicKey" BYTEA NOT NULL,
    "internalUserId" UUID NOT NULL,
    "webauthnUserId" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "backupEligible" BOOLEAN NOT NULL,
    "backupStatus" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passkey_webauthnUserId_key" ON "Passkey"("webauthnUserId");

-- CreateIndex
CREATE INDEX "Passkey_internalUserId_id_idx" ON "Passkey"("internalUserId", "id");

-- CreateIndex
CREATE INDEX "Passkey_webauthnUserId_id_idx" ON "Passkey"("webauthnUserId", "id");

-- CreateIndex
CREATE INDEX "Passkey_id_idx" ON "Passkey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Passkey_internalUserId_webauthnUserId_key" ON "Passkey"("internalUserId", "webauthnUserId");

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_internalUserId_fkey" FOREIGN KEY ("internalUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
