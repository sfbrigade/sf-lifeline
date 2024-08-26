import { useState } from 'react';
import { Accordion, TextInput, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import MedicalDataSearch from './MedicalDataSearch';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      patientData: {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: null,
        dateOfBirth: '',
      },
      contactData: {
        firstName: '',
        middleName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        relationship: null,
      },
      medicalData: {
        allergies: [],
        medications: [],
        conditions: [],
      },
      healthcareChoices: {
        hopsital: '',
        pcp: '',
      },
      codeStatus: null,
    },
    validate: {
      patientData: {
        firstName: (value) => (!value ? 'First Name is required' : null),
        lastName: (value) => (!value ? 'Last Name is required' : null),
        gender: (value) => (!value ? 'Gender is required' : null),
        dateOfBirth: (value) =>
          value.match(/^\d{4}-\d{2}-\d{2}$/)
            ? null
            : 'Date of Birth is not in YYYY-MM-DD format',
      },
      contactData: {
        firstName: (value) => (!value ? 'First Name is required' : null),
        lastName: (value) => (!value ? 'Last Name is required' : null),
        phoneNumber: (value) => (!value ? 'Phone Number is required' : null),
        email: (value) => (!value ? 'Email is required' : null),
        relationship: (value) => (!value ? 'Relationship is required' : null),
      },
      medicalData: {
        allergies: (value) => (!value ? 'Allergies is required' : null),
        medications: (value) => (!value ? 'Medications is required' : null),
        conditions: (value) => (!value ? 'Conditions is required' : null),
      },
      healthcareChoices: {
        hopsital: (value) => (!value ? 'Hopsital is required' : null),
        pcp: (value) => (!value ? 'PCP is required' : null),
      },
      codeStatus: (value) => (!value ? 'Code Status is required' : null),
    },
  });

  const [medicalData, setMedicalData] = useState({
    allergies: [],
    medications: [],
    conditions: [],
  });

  // console.log(medicalData);

  /**
   *
   * @param {object} values
   */
  function submitPatient(values) {
    console.log('Submitted');
    console.log(values);
  }

  /**
   *
   * @param {string} value
   */
  function handleAccordionChange(value) {
    console.log(value);
  }

  return (
    <main>
      <h1>Register Patients</h1>
      <form onSubmit={form.onSubmit(submitPatient)}>
        <Accordion defaultValue="patient-data" onChange={handleAccordionChange}>
          <Accordion.Item value="patient-data">
            <Accordion.Control>Basic Information</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="First Name"
                placeholder="First Name"
                key={form.key('patientData.firstName')}
                {...form.getInputProps('patientData.firstName')}
              />
              <TextInput
                label="Middle Name"
                placeholder="Middle Name"
                key={form.key('patientData.middleName')}
                {...form.getInputProps('patientData.middleName')}
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                key={form.key('patientData.lastName')}
                {...form.getInputProps('patientData.lastName')}
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
                key={form.key('patientData.gender')}
                {...form.getInputProps('patientData.gender')}
                clearable
              />
              <TextInput
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                key={form.key('patientData.dateOfBirth')}
                {...form.getInputProps('patientData.dateOfBirth')}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="contact-data">
            <Accordion.Control>Emergency Contact</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="First Name"
                placeholder="First Name"
                key={form.key('contactData.firstName')}
                {...form.getInputProps('contactData.firstName')}
              />
              <TextInput
                label="Middle Name"
                placeholder="Middle Name"
                key={form.key('contactData.middleName')}
                {...form.getInputProps('contactData.middleName')}
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                key={form.key('contactData.lastName')}
                {...form.getInputProps('contactData.lastName')}
              />
              <TextInput
                label="Phone Number"
                placeholder="Phone Number"
                key={form.key('contactData.phoneNumber')}
                {...form.getInputProps('contactData.phoneNumber')}
              />
              <TextInput
                label="Email"
                placeholder="Email"
                key={form.key('contactData.email')}
                {...form.getInputProps('contactData.email')}
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
                key={form.key('contactData.relationship')}
                {...form.getInputProps('contactData.relationship')}
                clearable
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="medical-data">
            <Accordion.Control>Medical Information</Accordion.Control>
            <Accordion.Panel>
              {Object.keys(medicalData).map((category) => {
                return (
                  <MedicalDataSearch
                    category={category}
                    key={category}
                    handleMedicalData={setMedicalData}
                  />
                );
              })}
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="healthcare-choices">
            <Accordion.Control>Healthcare Choices</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="Hopsital"
                placeholder="Hopsital"
                key={form.key('healthcareChoices.hopsital')}
                {...form.getInputProps('healthcareChoices.hopsital')}
              />
              <TextInput
                label="PCP"
                placeholder="PCP"
                key={form.key('healthcareChoices.pcp')}
                {...form.getInputProps('healthcareChoices.pcp')}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="code-status">
            <Accordion.Control>Advanced Directive</Accordion.Control>
            <Accordion.Panel>
              <Select
                label="Code Status"
                placeholder="Select Code Status"
                data={['Comfort', 'DNR', 'DNI', 'DNR DNI', 'Full']}
                key={form.key('codeStatus')}
                {...form.getInputProps('codeStatus')}
                clearable
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Button type="submit">Register Patient</Button>
      </form>
    </main>
  );
}
