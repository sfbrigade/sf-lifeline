import { AllergyType, CodingSystem } from '@prisma/client';

import prisma from '../client.js';

const MedicationAllergyURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicationAllergy/MedicationAllergy.json';
const EnvFoodAllergyURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/EnvironmentalFoodAllergy/EnvironmentalFoodAllergy.json';

export async function seedMedicationAllergies () {
  try {
    const response = await fetch(MedicationAllergyURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        type: AllergyType.DRUG,
        system: CodingSystem.ICD10,
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

export async function seedEnvFoodAllergies () {
  try {
    const response = await fetch(EnvFoodAllergyURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        type: AllergyType.OTHER,
        system: CodingSystem.SNOMED,
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
