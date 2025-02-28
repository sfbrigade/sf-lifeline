import { CodingSystem } from '@prisma/client';

import prisma from '../client.js';

const MedicalSurgicalURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicalSurgicalHistory/MedicalSurgicalHistory.json';

export async function seedConditions () {
  try {
    const response = await fetch(MedicalSurgicalURL);
    const data = await response.json();
    const codeList = data.DefinedList.Codes.Code;

    const formattedCodesList = codeList.map((code) => {
      return {
        name: code.SuggestedLabel,
        category: code.Category,
        system: CodingSystem.ICD10,
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

export default seedConditions;
