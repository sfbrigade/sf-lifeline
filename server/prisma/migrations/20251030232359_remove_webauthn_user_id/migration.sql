/*
  Warnings:

  - You are about to drop the column `webauthnUserId` on the `Passkey` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Passkey_internalUserId_webauthnUserId_key";

-- DropIndex
DROP INDEX "Passkey_webauthnUserId_id_idx";

-- DropIndex
DROP INDEX "Passkey_webauthnUserId_key";

-- AlterTable
ALTER TABLE "Passkey" DROP COLUMN "webauthnUserId";
