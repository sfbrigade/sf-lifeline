import { CodingSystem } from '@prisma/client';

import prisma from '../client.js';

const RxNormAPIEndpoint =
  'https://rxnav.nlm.nih.gov/REST/Prescribe/allconcepts.json?tty=BN%20IN';

export async function seedMedications () {
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
        name,
        altNames: alt,
        system: CodingSystem.RXNORM,
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

export default seedMedications;
