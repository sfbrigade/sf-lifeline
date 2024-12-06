-- AlterTable
ALTER TABLE "_HospitalToPhysician" ADD CONSTRAINT "_HospitalToPhysician_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_HospitalToPhysician_AB_unique";
