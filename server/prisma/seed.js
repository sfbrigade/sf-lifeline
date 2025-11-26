import prisma from './client.js';

import { seedAdminUser } from './seeds/admin.js';
import { seedEnvFoodAllergies, seedMedicationAllergies } from './seeds/allergies.js';
import { seedConditions } from './seeds/conditions.js';
import { seedHospitals } from './seeds/hospitals.js';
import { seedMedications } from './seeds/medications.js';
import { seedPhysicians } from './seeds/physicians.js';
import { seedUsers } from './seeds/users.js';

async function main () {
  await seedAdminUser();
  await seedConditions();
  await seedMedicationAllergies();
  await seedEnvFoodAllergies();
  await seedMedications();
  await seedHospitals();
  await seedPhysicians();
  await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
