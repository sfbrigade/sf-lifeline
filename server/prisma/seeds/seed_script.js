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
        system: CodingSystemEnum.ICD10,
        code: code.Value.Value,
      };
    });
    console.log(formattedCodesList);
  } catch (error) {
    console.error('Error fetching the JSON file:', error);
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
    console.log(formattedCodesList);
  } catch (error) {
    console.error('Error fetching the JSON file:', error);
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
        type: code.Category,
        system: CodingSystemEnum.SNOMED,
        code: code.Value.Value,
      };
    });
    console.log(formattedCodesList);
  } catch (error) {
    console.error('Error fetching the JSON file:', error);
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
    const formattedCodesList = codeList.map((code) => {
      const regex = /(?:{(\d+) )?([^}]+)(?:})?/;
      const match = code.name.match(regex);
      if (match) {
        const numberOfPacks = match[1] ? parseInt(match[1]) : 1;
        const medicineDetails = match[2].trim().replace(/^\((.*)\)$/, '$1');
      } else {
        console.log('No match found');
      }
      return {
        name: code.name,
        alternate_names: code.name,
        system: CodingSystemEnum.RXNORM,
        code: code.rxcui,
      };
    });

    // console.log(formattedCodesList);
  } catch (error) {
    console.error('Error fetching the RxNorm API:', error);
  }
}

// seedConditions();
// seedMedicationAllergies();
// seedEnvFoodAllergies();
seedMedications();
