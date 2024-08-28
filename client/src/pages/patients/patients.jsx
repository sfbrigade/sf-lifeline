import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StatusCodes } from 'http-status-codes';
import { Accordion, TextInput, Select, Button, Loader } from '@mantine/core';
import { useForm, isNotEmpty, matches } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import MedicalDataSearch from './MedicalDataSearch';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const [loading, setLoading] = useState(false);
  const [openedSection, setOpenedSection] = useState('patientData');
  const { patientId } = useParams();

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
        firstName: isNotEmpty('First Name is required'),
        lastName: isNotEmpty('Last Name is required'),
        language: isNotEmpty('Language is required'),
        gender: isNotEmpty('Gender is required'),
        dateOfBirth: matches(
          /^\d{4}-\d{2}-\d{2}$/,
          'Date of Birth is not in YYYY-MM-DD format',
        ),
      },
      contactData: {
        firstName: isNotEmpty('First Name is required'),
        lastName: isNotEmpty('Last Name is required'),
        phone: matches(
          /^\d{3}-\d{3}-\d{4}$/,
          'Phone number is not in XXX-XXX-XXXX format',
        ),
        relationship: isNotEmpty('Relationship is required'),
      },
      healthcareChoices: {
        hospitalId: isNotEmpty('Hospital is required'),
        physicianId: isNotEmpty('PCP is required'),
      },
      codeStatus: isNotEmpty('Code Status is required'),
    },
    validateInputOnBlur: true,
  });

  /**
   * Submit patient data to server for registration
   * @param {object} data
   */
  async function registerPatient(data) {
    const res = await fetch('/api/v1/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, id: patientId }),
    });

    return res;
  }

  /**
   * Submit patient data to server for update
   * @param {object} data
   */
  async function updatePatient(data) {
    console.log(data);
    const res = await fetch(`/api/v1/patients/${patientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res;
  }

  const showSuccessNotification = (message) => {
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
    });
  };

  const showErrorNotification = (err) => {
    notifications.show({
      title: 'Error',
      message: err.message,
      color: 'red',
    });
  };

  /**
   *
   * @param {object} values
   */
  async function submitPatient(values) {
    setLoading(true);

    const {
      patientData,
      contactData,
      medicalData,
      healthcareChoices,
      codeStatus,
    } = values;

    patientData.id = patientId;
    try {
      const res = await updatePatient({
        patientData,
        contactData,
        medicalData,
        healthcareChoices,
        codeStatus,
      });
      if (res.status === StatusCodes.OK) {
        showSuccessNotification('Successfully registered patient.');
      } else {
        throw new Error('Failed to update patient');
      }
    } catch (err) {
      console.error(err.message);
      showErrorNotification(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   *
   * @param {object} data
   */
  async function registerOrUpdatePatient(data) {
    try {
      const res = await registerPatient(data);

      if (res.status === StatusCodes.CREATED) {
        showSuccessNotification(
          'Patient basic information has been successfully registered.',
        );
      } else if (res.status === StatusCodes.CONFLICT) {
        const updateRes = await updatePatient({ patientData: data });
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification(
            'Patient basic information has been successfully updated.',
          );
        }
      } else {
        throw new Error('Failed to register patient');
      }
    } catch (err) {
      console.error(err);
      showErrorNotification(err);
    }
  }

  /**
   *
   * @param {object} data
   */
  async function updatePatientRecord(data) {
    try {
      const res = await updatePatient(data);
      if (res.status === StatusCodes.OK) {
        showSuccessNotification(
          'Patient information has been successfully updated.',
        );
      } else if (!res.status.ok) {
        throw new Error('Failed to update patient');
      }
    } catch (err) {
      console.error(err);
      showErrorNotification(err);
    }
  }

  /**
   *
   * @param {string} value
   */
  async function handleAccordionChange(value) {
    console.log(value, openedSection);
    if (!openedSection) {
      setOpenedSection(value);
      return;
    }

    let errorFieldCount = 0;

    if (openedSection === 'codeStatus') {
      form.isValid(`${openedSection}`) ? null : errorFieldCount++;
    }

    for (const field in form.getValues()[openedSection]) {
      form.validateField(`${openedSection}.${field}`);
      form.isValid(`${openedSection}.${field}`) ? null : errorFieldCount++;
    }

    if (errorFieldCount === 0) {
      setOpenedSection(value);

      if (openedSection === 'patientData') {
        const patientData = form.getValues().patientData;
        await registerOrUpdatePatient(patientData);
      } else {
        const formData = form.getValues()[openedSection];
        console.log(formData);
        await updatePatientRecord({ [openedSection]: formData });
      }
    } else {
      setOpenedSection(openedSection);
    }
  }

  /**
   *
   * @param {object} errors
   */
  function handleErrors(errors) {
    // Set focus to the first error field
    const firstErrorPath = Object.keys(errors)[0];
    form.getInputNode(firstErrorPath)?.focus();
    setOpenedSection(firstErrorPath.split('.')[0]);

    // Create a message for which sections have errors
    const errorKeys = Object.keys(errors).map((key) => key.split('.')[0]);
    const errorSets = new Set(errorKeys);

    const errorSectionMap = {
      patientData: 'Patient Data',
      contactData: 'Emergency Contact',
      medicalData: 'Medical Information',
      healthcareChoices: 'Healthcare Choices',
      codeStatus: 'Advanced Directive',
    };

    let errorSections = [];
    errorSets.forEach((key) => {
      errorSections.push(errorSectionMap[key]);
    });

    notifications.show({
      title: 'Error',
      message: `Please fix the following sections: ${errorSections.join(', ')}`,
      color: 'red',
    });
  }

  return (
    <main>
      <h1>Register Patients</h1>
      <form onSubmit={form.onSubmit(submitPatient, handleErrors)}>
        <Accordion
          defaultValue="patientData"
          value={openedSection}
          onChange={handleAccordionChange}
        >
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
                placeholder="XXX-XXX-XXXX"
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
                label="Primary Care Provider"
                placeholder="Primary Care Provider"
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
