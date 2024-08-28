import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StatusCodes } from 'http-status-codes';
import { Flex, Button } from '@mantine/core';
import { useForm, isNotEmpty, matches } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

import PatientRegistrationAccordion from './PatientRegistrationAccordion';

/**
 *  Patients page component
 *
 */
export default function PatientRegistration() {
  const [loading, setLoading] = useState(false);
  const [openedSection, setOpenedSection] = useState('patientData');
  const { patientId } = useParams();
  const navigate = useNavigate();

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

  const showErrorNotification = (message) => {
    notifications.show({
      title: 'Error',
      message,
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
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Failed to update patient.');
      }
    } catch (err) {
      console.error(err);
      showErrorNotification(err.message);
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
      }
      if (res.status === StatusCodes.CONFLICT) {
        const updateRes = await updatePatient({ patientData: data });
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification(
            'Patient basic information has been successfully updated.',
          );
        }
      }

      if (res.status === StatusCodes.BAD_REQUEST) {
        throw new Error('Invalid patient ID URL.');
      }

      if (!res.status.ok) {
        throw new Error('Failed to register patient.');
      }
    } catch (err) {
      console.error(err);
      showErrorNotification(err.message);
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
      }

      if (res.status === StatusCodes.BAD_REQUEST) {
        throw new Error('Invalid data provided.');
      }

      if (res.status === StatusCodes.NOT_FOUND) {
        throw new Error('Patient ID not found.');
      }

      if (!res.status.ok) {
        throw new Error('Failed to update patient.');
      }
    } catch (err) {
      console.error(err);
      showErrorNotification(err.message);
    }
  }

  /**
   *
   * @param {string} value
   */
  async function handleAccordionChange(value) {
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

    showErrorNotification(
      `Please fix the following sections: ${errorSections.join(', ')}`,
    );
  }

  return (
    <main>
      <h1>Register Patient</h1>
      <Flex direction="column" gap="md">
        <form onSubmit={form.onSubmit(submitPatient, handleErrors)}>
          <PatientRegistrationAccordion
            form={form}
            openedSection={openedSection}
            handleAccordionChange={handleAccordionChange}
          />
          <Flex justify="center" mt="md">
            <Button
              type="submit"
              color="gray"
              fullWidth
              loading={loading}
              loaderProps={{ type: 'dots' }}
            >
              Register Patient
            </Button>
          </Flex>
        </form>
      </Flex>
    </main>
  );
}
