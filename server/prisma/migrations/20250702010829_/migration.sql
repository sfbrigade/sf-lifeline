-- AlterTable
ALTER TABLE "Allergy" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Condition" ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Medication" ALTER COLUMN "code" DROP NOT NULL;
