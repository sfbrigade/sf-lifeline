import { useState } from 'react';
import { Accordion, TextInput, Select } from '@mantine/core';

import MedicalDataSearch from './MedicalDataSearch';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const [patientForm, setPaitentForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: null,
    dateOfBirth: '',
  });

  const [contactData, setContactData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    relationship: null,
  });

  const [medicalData, setMedicalData] = useState({
    allergies: [],
    medications: [],
    conditions: [],
  });

  console.log(medicalData);

  const [healthcareChoices, setHealthcareChoices] = useState({
    hopsital: '',
    pcp: '',
  });

  const [codeStatus, setCodeStatus] = useState(null);

  /**
   *
   * @param {Event} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    console.log('Submitted');
  }

  return (
    <main>
      <h1>Patients</h1>
      <Accordion defaultValue="patient-form">
        <Accordion.Item value="patient-form">
          <Accordion.Control>Patient Form</Accordion.Control>
          <Accordion.Panel>
            <form onSubmit={handleSubmit}>
              <TextInput
                label="First Name"
                placeholder="First Name"
                value={patientForm.firstName}
                onChange={(event) =>
                  setPaitentForm({
                    ...patientForm,
                    firstName: event.target.value,
                  })
                }
              />
              <TextInput
                label="Middle Name"
                placeholder="Middle Name"
                value={patientForm.middleName}
                onChange={(event) =>
                  setPaitentForm({
                    ...patientForm,
                    middleName: event.target.value,
                  })
                }
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                value={patientForm.lastName}
                onChange={(event) =>
                  setPaitentForm({
                    ...patientForm,
                    lastName: event.target.value,
                  })
                }
              />
              <Select
                label="Gender"
                placeholder="Select Gender"
                data={[
                  'Female',
                  'Male',
                  'Trans Male',
                  'Trans Female',
                  'Other',
                  'Unknown',
                ]}
                value={patientForm.gender}
                onChange={(value) =>
                  setPaitentForm({ ...patientForm, gender: value })
                }
                clearable
              />
              <TextInput
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                value={patientForm.dateOfBirth}
                onChange={(event) =>
                  setPaitentForm({
                    ...patientForm,
                    dateOfBirth: event.target.value,
                  })
                }
              />
            </form>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="contact-data">
          <Accordion.Control>Contact Data</Accordion.Control>
          <Accordion.Panel>
            <form onSubmit={handleSubmit}>
              <TextInput
                label="First Name"
                placeholder="First Name"
                value={contactData.firstName}
                onChange={(event) =>
                  setContactData({
                    ...contactData,
                    firstName: event.target.value,
                  })
                }
              />
              <TextInput
                label="Middle Name"
                placeholder="Middle Name"
                value={contactData.middleName}
                onChange={(event) =>
                  setContactData({
                    ...contactData,
                    middleName: event.target.value,
                  })
                }
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                value={contactData.lastName}
                onChange={(event) =>
                  setContactData({
                    ...contactData,
                    lastName: event.target.value,
                  })
                }
              />
              <TextInput
                label="Phone Number"
                placeholder="Phone Number"
                value={contactData.phoneNumber}
                onChange={(event) =>
                  setContactData({
                    ...contactData,
                    phoneNumber: event.target.value,
                  })
                }
              />
              <TextInput
                label="Email"
                placeholder="Email"
                value={contactData.email}
                onChange={(event) =>
                  setContactData({ ...contactData, email: event.target.value })
                }
              />
              <Select
                label="Relationship"
                placeholder="Select Relationship"
                data={[
                  'Spouse',
                  'Parent',
                  'Child',
                  'Sibling',
                  'Other',
                  'Unknown',
                ]}
                value={contactData.relationship}
                onChange={(value) =>
                  setContactData({ ...contactData, relationship: value })
                }
                clearable
              />
            </form>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="medical-data">
          <Accordion.Control>Medical Data</Accordion.Control>
          <Accordion.Panel>
            <form onSubmit={handleSubmit}>
              {Object.keys(medicalData).map((category) => {
                return (
                  <MedicalDataSearch
                    category={category}
                    key={category}
                    handleMedicalData={setMedicalData}
                  />
                );
              })}
            </form>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="healthcare-choices">
          <Accordion.Control>Healthcare Choices</Accordion.Control>
          <Accordion.Panel>
            <form onSubmit={handleSubmit}>
              <TextInput
                label="Hopsital"
                placeholder="Hopsital"
                value={healthcareChoices.hopsital}
                onChange={(value) =>
                  setHealthcareChoices({
                    ...healthcareChoices,
                    hopsital: value,
                  })
                }
              />
              <TextInput
                label="PCP"
                placeholder="PCP"
                value={healthcareChoices.pcp}
                onChange={(value) =>
                  setHealthcareChoices({ ...healthcareChoices, pcp: value })
                }
              />
            </form>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="code-status">
          <Accordion.Control>Code Status</Accordion.Control>
          <Accordion.Panel>
            <form onSubmit={handleSubmit}>
              <Select
                label="Code Status"
                placeholder="Select Code Status"
                data={['Comfort', 'DNR', 'DNI', 'DNR DNI', 'Full']}
                value={codeStatus}
                onChange={(value) => setCodeStatus(value)}
                clearable
              />
            </form>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </main>
  );
}
