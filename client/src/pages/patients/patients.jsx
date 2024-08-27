import { useState } from 'react';
import { Accordion, TextInput, Select, Button, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import MedicalDataSearch from './MedicalDataSearch';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      patientData: {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: null,
        language: null,
        dateOfBirth: '',
      },
      contactData: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: null,
      },
      medicalData: {
        allergies: [],
        medications: [],
        conditions: [],
      },
      healthcareChoices: {
        hospitalId: '',
        physicianId: '',
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
        phone: (value) => (!value ? 'Phone number is required' : null),
        relationship: (value) => (!value ? 'Relationship is required' : null),
      },
      medicalData: {
        allergies: (value) => (!value ? 'Allergies is required' : null),
        medications: (value) => (!value ? 'Medications is required' : null),
        conditions: (value) => (!value ? 'Conditions is required' : null),
      },
      healthcareChoices: {
        hospitalId: (value) => (!value ? 'Hospital is required' : null),
        physicianId: (value) => (!value ? 'PCP is required' : null),
      },
      codeStatus: (value) => (!value ? 'Code Status is required' : null),
    },
    validateInputOnBlur: true,
  });

  /**
   *
   * @param {object} values
   */
  function submitPatient(values) {
    console.log('clicking');
    setLoading(true);
    console.log(values);
    const {
      patientData,
      contactData,
      medicalData,
      healthcareChoices,
      codeStatus,
    } = values;
    const patientID = '2ce9bfc7-ab6d-4fe0-a22e-bb83f1874664';
    patientData.id = patientID;

    fetch('/api/v1/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    })
      .then((res) =>
        res.status === 201
          ? fetch(`/api/v1/patients/${patientID}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contactData,
                medicalData,
                healthcareChoices,
                patientData: { codeStatus },
              }),
            })
              .then((res) =>
                res.status === 200
                  ? console.log('Successfully updated patient')
                  : Promise.reject(new Error('Failed to update patient')),
              )
              .catch((err) => {
                console.log(err);
              })
          : Promise.reject(new Error('Failed to create patient')),
      )
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log('Finished');
        setLoading(false);
      });
  }

  /**
   *
   * @param {string} value
   */
  function handleAccordionChange(value) {
    console.log(value);
    console.log(form.getValues());
  }

  /**
   *
   * @param {object} errors
   */
  function handleErrors(errors) {
    console.log(errors);
  }

  return (
    <main>
      <h1>Register Patients</h1>
      <form onSubmit={form.onSubmit(submitPatient, handleErrors)}>
        <Accordion defaultValue="patientData" onChange={handleAccordionChange}>
          <Accordion.Item value="patientData">
            <Accordion.Control>Basic Information</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="First Name"
                placeholder="First Name"
                withAsterisk
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
                withAsterisk
                key={form.key('patientData.lastName')}
                {...form.getInputProps('patientData.lastName')}
              />
              <Select
                label="Gender"
                placeholder="Select Gender"
                withAsterisk
                data={[
                  'FEMALE',
                  'MALE',
                  'TRANS_MALE',
                  'TRANS_FEMALE',
                  'OTHER',
                  'UNKNOWN',
                ]}
                key={form.key('patientData.gender')}
                {...form.getInputProps('patientData.gender')}
                clearable
              />
              <Select
                label="Language"
                placeholder="Select Language"
                withAsterisk
                data={[
                  'CANTONESE',
                  'ENGLISH',
                  'MANDARIN',
                  'RUSSIAN',
                  'SPANISH',
                  'TAGALOG',
                ]}
                key={form.key('patientData.language')}
                {...form.getInputProps('patientData.language')}
                clearable
              />
              <TextInput
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                withAsterisk
                key={form.key('patientData.dateOfBirth')}
                {...form.getInputProps('patientData.dateOfBirth')}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="contactData">
            <Accordion.Control>Emergency Contact</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="First Name"
                placeholder="First Name"
                withAsterisk
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
                withAsterisk
                key={form.key('contactData.lastName')}
                {...form.getInputProps('contactData.lastName')}
              />
              <TextInput
                label="Phone Number"
                placeholder="Phone Number"
                withAsterisk
                key={form.key('contactData.phone')}
                {...form.getInputProps('contactData.phone')}
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
                withAsterisk
                data={[
                  'SPOUSE',
                  'PARENT',
                  'CHILD',
                  'SIBLING',
                  'OTHER',
                  'UNKNOWN',
                ]}
                key={form.key('contactData.relationship')}
                {...form.getInputProps('contactData.relationship')}
                clearable
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="medicalData">
            <Accordion.Control>Medical Information</Accordion.Control>
            <Accordion.Panel>
              {Object.keys(form.getValues().medicalData).map((category) => {
                return (
                  <MedicalDataSearch
                    category={category}
                    form={form}
                    key={category}
                  />
                );
              })}
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="healthcareChoices">
            <Accordion.Control>Healthcare Choices</Accordion.Control>
            <Accordion.Panel>
              <TextInput
                label="Hospital"
                placeholder="Hospital"
                withAsterisk
                key={form.key('healthcareChoices.hospitalId')}
                {...form.getInputProps('healthcareChoices.hospitalId')}
              />
              <TextInput
                label="PCP"
                placeholder="PCP"
                withAsterisk
                key={form.key('healthcareChoices.physicianId')}
                {...form.getInputProps('healthcareChoices.physicianId')}
              />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="codeStatus">
            <Accordion.Control>Advanced Directive</Accordion.Control>
            <Accordion.Panel>
              <Select
                label="Code Status"
                placeholder="Select Code Status"
                withAsterisk
                data={['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL']}
                key={form.key('codeStatus')}
                {...form.getInputProps('codeStatus')}
                clearable
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        {loading ? (
          <Loader size="xl" />
        ) : (
          <Button type="submit">Register Patient</Button>
        )}
      </form>
    </main>
  );
}
