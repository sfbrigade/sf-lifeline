import prisma from './client.js';
import { User, Role } from '../models/user.js';

const MedicalSurgicalURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicalSurgicalHistory/MedicalSurgicalHistory.json';
const MedicationAllergyURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicationAllergy/MedicationAllergy.json';
const RxNormAPIEndpoint =
  'https://rxnav.nlm.nih.gov/REST/allstatus.json?status=ACTIVE';
const EnvFoodAllergyURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/EnvironmentalFoodAllergy/EnvironmentalFoodAllergy.json';

const CodingSystemEnum = {
  SNOMED: 'SNOMED',
  RXNORM: 'RXNORM',
  ICD10: 'ICD10',
};

const AllergyType = {
  DRUG: 'DRUG',
  OTHER: 'OTHER',
};

async function seedConditions() {
  try {
    const response = await fetch(MedicalSurgicalURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        category: code.Category,
        system: CodingSystemEnum.ICD10,
        code: code.Value.Value,
      };
    });

    await prisma.condition.createMany({
      data: formattedCodesList,
    });

    console.log('Conditions seeded successfully');
  } catch (error) {
    console.error('Error seeding conditions:', error);
  }
}

async function seedMedicationAllergies() {
  try {
    const response = await fetch(MedicationAllergyURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        type: AllergyType.DRUG,
        system: CodingSystemEnum.ICD10,
        code: code.Value.Value,
      };
    });

    await prisma.allergy.createMany({
      data: formattedCodesList,
    });

    console.log('Medication allergies seeded successfully');
  } catch (error) {
    console.error('Error seeding medication allergies:', error);
  }
}

async function seedEnvFoodAllergies() {
  try {
    const response = await fetch(EnvFoodAllergyURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        type: AllergyType.OTHER,
        system: CodingSystemEnum.SNOMED,
        code: code.Value.Value,
      };
    });

    await prisma.allergy.createMany({
      data: formattedCodesList,
    });

    console.log('Env/Food allergies seeded successfully');
  } catch (error) {
    console.error('Error seeding env/food allergies:', error);
  }
}

async function seedMedications() {
  try {
    const response = await fetch(RxNormAPIEndpoint);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const codeList = data.minConceptGroup.minConcept;

    const packRegex = /\{([^}]+)\} Pack(?: \[([^\]]+)\])?/;
    const nonPackRegex = /^(.*?)\s?(\[([^\]]+)\])?$/;

    const formattedCodesList = codeList.map((code) => {
      const packMatch = code.name.match(packRegex);
      const nonPackMatch = code.name.match(nonPackRegex);

      let name = '';
      let alt = '';

      if (packMatch) {
        const medicineDetails = packMatch[1].trim();
        const nameMatch = packMatch[2];

        if (nameMatch) {
          name = nameMatch.trim();
          alt = medicineDetails;
        } else {
          name = medicineDetails;
        }
      } else if (nonPackMatch) {
        const medicineDetails = nonPackMatch[1].trim();
        const nameMatch = nonPackMatch[3] ? nonPackMatch[3].trim() : '';
        if (nameMatch) {
          name = nameMatch;
          alt = medicineDetails;
        } else {
          name = medicineDetails;
        }
      } else {
        console.log('no match: ', code.name);
      }

      return {
        name: name,
        altNames: alt,
        system: CodingSystemEnum.RXNORM,
        code: code.rxcui,
      };
    });

    await prisma.medication.createMany({
      data: formattedCodesList,
    });
    console.log('Medications seeded successfully');
  } catch (error) {
    console.error('Error seeding medications :', error);
  }
}

async function seedAdminUser() {
  const now = new Date();
  const data = {};
  const user = new User(data);
  user.firstName = 'Admin';
  user.lastName = 'User';
  user.email = 'admin.user@test.com';
  await user.setPassword('Abcd1234!');
  user.role = Role.ADMIN;
  user.emailVerifiedAt = now;
  user.approvedAt = now;
  await prisma.user.create({ data });
  console.log('Admin User seeded successfully');
}

async function main() {
  await seedAdminUser();
  await seedConditions();
  await seedMedicationAllergies();
  await seedEnvFoodAllergies();
  await seedMedications();
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
