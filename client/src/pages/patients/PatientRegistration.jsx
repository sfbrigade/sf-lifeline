import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StatusCodes } from 'http-status-codes';
import { Flex, Button } from '@mantine/core';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from './LifelineAPI.js';
import PatientRegistrationAccordion from './PatientRegistrationAccordion';

const TABS = [
  'patientData',
  'contactData',
  'medicalData',
  'healthcareChoices',
  'codeStatus',
];

/**
 *  Patients page component
 *
 */
export default function PatientRegistration() {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [initialMedicalData, setInitialMedicalData] = useState({});
  const [initialHospitalData, setInitialHospitalData] = useState({});
  const [initialPhysicianData, setInitialPhysicianData] = useState({});
  const [openedSection, setOpenedSection] = useState('patientData');
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isSuccess } = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/patients/${patientId}`);
      if (res.status === StatusCodes.OK) {
        return res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    // disable retry and refetch on window focus to prevent data loss
    // from triggering form.initialize()
    retry: false,
    refetchOnWindowFocus: false,
  });

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

    transformValues: (values) => ({
      ...values,
      patientData: {
        ...values.patientData,
        dateOfBirth: values.patientData.dateOfBirth.toISOString().split('T')[0],
      },
    }),

    validate: {
      patientData: {
        firstName: isNotEmpty('First Name is required'),
        lastName: isNotEmpty('Last Name is required'),
        language: isNotEmpty('Language is required'),
        gender: isNotEmpty('Gender is required'),
        dateOfBirth: isNotEmpty('Date of Birth is required'),
      },
      contactData: {
        firstName: isNotEmpty('First Name is required'),
        lastName: isNotEmpty('Last Name is required'),
        phone: (value) =>
          value.length === 0 || value.match(/^\(\d{3}\)-\d{3}-\d{4}$/)
            ? null
            : 'Phone number is not in XXX-XXX-XXXX format',
        relationship: isNotEmpty('Relationship is required'),
      },
      codeStatus: isNotEmpty('Code Status is required'),
    },
    validateInputOnBlur: true,
  });

  // Opens the section based on the hash in the URL
  useEffect(() => {
    let section = location.hash.replace('#', '');
    if (section === '') section = 'patientData';
    setOpenedSection(section);
    // NOTE: Only want this useEffect to run once on mount to set the opened section
    // eslint-disable-next-line
  }, []);

  // Sets the initial values of the form based on the data from an existing patient
  useEffect(() => {
    if (data && isSuccess) {
      const { firstName, middleName, lastName, gender, language, dateOfBirth } =
        data;
      const { emergencyContact } = data;
      const { allergies, medications, conditions } = data;
      const { hospital, physician } = data;
      const codeStatus = data?.codeStatus;

      setInitialMedicalData({
        allergies: allergies.map((entry) => {
          return { id: entry.allergy.id, name: entry.allergy.name };
        }),
        medications: medications.map((entry) => {
          return { id: entry.medication.id, name: entry.medication.name };
        }),
        conditions: conditions.map((entry) => {
          return { id: entry.condition.id, name: entry.condition.name };
        }),
      });

      setInitialHospitalData({
        id: hospital ? hospital.id : '',
        name: hospital ? hospital.name : '',
      });

      setInitialPhysicianData({
        id: physician ? physician.id : '',
        name: physician ? `${physician.firstName} ${physician.lastName}` : '',
      });

      const patientData = {
        firstName,
        middleName,
        lastName,
        gender,
        language,
        dateOfBirth: new Date(dateOfBirth),
      };
      const contactData = {
        ...emergencyContact,
        phone: emergencyContact?.phone || '',
      };
      const medicalData = {
        allergies: allergies.map((entry) => entry.allergy.id),
        medications: medications.map((entry) => entry.medication.id),
        conditions: conditions.map((entry) => entry.condition.id),
      };
      const healthcareChoices = {
        hospitalId: hospital ? hospital.id : '',
        physicianId: physician ? physician.id : '',
      };
      const codeStatusData = codeStatus;
      form.initialize({
        patientData,
        contactData,
        medicalData,
        healthcareChoices,
        codeStatus: codeStatusData,
      });
    }

    // NOTE: below is necessary to avoid infinite loop when adding form to depedency arrays
    // see this https://github.com/mantinedev/mantine/issues/5338#issuecomment-1837468066
    // eslint-disable-next-line
  }, [data]);

  console.log(form.getValues());

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
      const res = await LifelineAPI.registerPatient(patientData, patientId);

      if (res.status === StatusCodes.CREATED) {
        const updateRes = await LifelineAPI.updatePatient(
          {
            contactData,
            medicalData,
            healthcareChoices,
            codeStatus,
          },
          patientId,
        );
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification('Successfully registered patient.');
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      if (res.status === StatusCodes.CONFLICT) {
        const updateRes = await LifelineAPI.updatePatient(
          {
            patientData,
            contactData,
            medicalData,
            healthcareChoices,
            codeStatus,
          },
          patientId,
        );
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification(
            'Patient basic information has been successfully updated.',
          );
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      throw new Error('Failed to register patient.');
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
      const res = await LifelineAPI.registerPatient(data, patientId);
      if (res.status === StatusCodes.CREATED) {
        showSuccessNotification(
          'Patient basic information has been successfully registered.',
        );
        return;
      }

      if (res.status === StatusCodes.CONFLICT) {
        const updateRes = await LifelineAPI.updatePatient(
          { patientData: data },
          patientId,
        );
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification(
            'Patient basic information has been successfully updated.',
          );
          return;
        }
        throw new Error('Failed to update patient.');
      }

      if (res.status === StatusCodes.BAD_REQUEST) {
        throw new Error('Invalid patient ID URL.');
      }

      throw new Error('Failed to register patient.');
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
      const res = await LifelineAPI.updatePatient(data, patientId);
      if (res.status === StatusCodes.OK) {
        showSuccessNotification(
          'Patient information has been successfully updated.',
        );
        return;
      }
      if (res.status === StatusCodes.BAD_REQUEST) {
        throw new Error('Invalid data provided.');
      }
      if (res.status === StatusCodes.NOT_FOUND) {
        throw new Error('Patient ID not found.');
      }

      throw new Error('Failed to update patient.');
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
    console.log(value, openedSection, active, TABS.indexOf(value));

    console.log(value);
    value === null ? navigate('') : navigate(`#${value}`);

    if (!openedSection) {
      setOpenedSection(value);
      setActive(TABS.indexOf(value));
      return;
    }

    if (TABS.indexOf(value) < active) {
      setOpenedSection(value);
      setActive(TABS.indexOf(value));
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
      setActive(TABS.indexOf(value));

      if (openedSection === 'patientData') {
        const patientData = {
          ...form.getValues().patientData,
          dateOfBirth: form.getTransformedValues().patientData.dateOfBirth,
        };
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
            initialMedicalData={initialMedicalData}
            initialHospitalData={initialHospitalData}
            initialPhysicianData={initialPhysicianData}
            openedSection={openedSection}
            handleAccordionChange={handleAccordionChange}
          />
          <Flex justify="center" mt="md">
            <Button
              onClick={form.onSubmit(submitPatient, handleErrors)}
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
