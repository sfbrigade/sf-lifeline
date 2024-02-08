const MedicalSurgicalURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicalSurgicalHistory/MedicalSurgicalHistory.json';
const MedicationAllergyURL =
  'https://nemsis.org/media/nemsis_v3/master/SuggestedLists/MedicationAllergy/MedicationAllergy.json';
const RxNormAPIEndpoint =
  'https://rxnav.nlm.nih.gov/REST/allstatus.json?status=ALL';

const CodingSystemEnum = {
  SNOMED: 'SNOMED',
  RXNORM: 'RXNORM',
  ICD10: 'ICD10',
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
    // const formattedCodesList = codeList.map((code) => {
    //   return {
    //     name: code.SuggestedLabel,
    //     system: CodingSystemEnum.ICD10,
    //     code: code.Value.Value,
    //   };
    // });
    // console.log(formattedCodesList);
    console.log(codeList);
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
    console.log('JSON response:', data);
  } catch (error) {
    console.error('Error fetching the RxNorm API:', error);
  }
}

// seedConditions();
// seedMedicationAllergies();
seedMedications();
