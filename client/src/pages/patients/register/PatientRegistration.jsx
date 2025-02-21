import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { StatusCodes } from 'http-status-codes';
import { Flex, Button, Modal, Text, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '../LifelineAPI.js';
import PatientRegistrationAccordion from './PatientRegistrationAccordion';

const FORM_TABS = {
  patientData: 'Patient Data',
  contactData: 'Emergency Contact',
  medicalData: 'Medical Information',
  healthcareChoices: 'Healthcare Choices',
  codeStatus: 'Advanced Directive',
};

/**
 *  Patients page component
 *
 */
export default function PatientRegistration () {
  const [loading, setLoading] = useState(false);
  const [initialMedicalData, setInitialMedicalData] = useState({});
  const [initialHospitalData, setInitialHospitalData] = useState('');
  const [initialPhysicianData, setInitialPhysicianData] = useState('');
  const [openedSection, setOpenedSection] = useState('patientData');
  const [opened, { open, close }] = useDisclosure(false);

  const [showCheck, setShowCheck] = useState({
    patientData: false,
    contactData: false,
    medicalData: false,
    healthcareChoices: false,
    codeStatus: false,
  });

  const [visitedSections, setVisitedSections] = useState({
    patientData: true,
    contactData: false,
    medicalData: false,
    healthcareChoices: false,
    codeStatus: false,
  });
  const [unvisitedSections, setUnvisitedSections] = useState([]);

  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { existingPatient } = location.state ?? true;

  const { data, isSuccess } = useQuery({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await LifelineAPI.getPatient(patientId);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patient.');
      }
    },
    enabled: existingPatient,

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
        gender: 'UNKNOWN',
        language: 'ENGLISH',
        dateOfBirth: '',
      },
      contactData: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: 'UNKNOWN',
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
      codeStatus: 'FULL',
    },

    validate: {
      patientData: {
        firstName: isNotEmpty('First Name is required'),
        lastName: isNotEmpty('Last Name is required'),
        language: isNotEmpty('Language is required'),
        gender: isNotEmpty('Gender is required'),
        dateOfBirth: isNotEmpty('Date of Birth is required'),
      },
      contactData: {
        phone: (value) =>
          value.length === 0 || value.match(/^\(\d{3}\) \d{3}-\d{4}$/)
            ? null
            : 'Phone number is not in (XXX) XXX-XXXX format',
      },
    },
    validateInputOnBlur: true,
  });

  // Opens the section based on the hash in the URL
  useEffect(() => {
    let section = location.hash.replace('#', '');

    if (section === '') {
      section = 'patientData';
    }

    if (section !== 'patientData') {
      setVisitedSections((prevVisitedSections) => ({
        ...prevVisitedSections,
        [section]: true,
        patientData: false,
      }));
    }

    setOpenedSection(section);
    // NOTE: Only want this useEffect to run once on mount to set the opened section
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

      setInitialHospitalData(hospital ? hospital.name : '');

      if (physician) {
        const fullName = `${physician.firstName}${physician.middleName ? ` ${physician.middleName}` : ''} ${physician.lastName}`;
        const hospital = physician.hospitals[0]
          ? physician.hospitals[0].name
          : '';
        const phone = physician.phone ? `${physician.phone} ` : '';
        const physicianDetails = `${fullName}${hospital ? ` (${hospital})` : ''}${phone ? ` - ${phone}` : ''}`;
        setInitialPhysicianData(physicianDetails);
      }

      const patientData = {
        firstName,
        middleName,
        lastName,
        gender,
        language,
        dateOfBirth: dateOfBirth,
      };
      const contactData = {
        firstName: emergencyContact?.firstName || '',
        middleName: emergencyContact?.middleName || '',
        lastName: emergencyContact?.lastName || '',
        email: emergencyContact?.email || '',
        relationship: emergencyContact?.relationship || null,
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
  }, [data]);

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
  async function submitPatient (values) {
    setLoading(true);

    const {
      patientData,
      contactData,
      medicalData,
      healthcareChoices,
      codeStatus,
    } = values;

    const unvisited = Object.entries(visitedSections)
      .filter(([_, visited]) => !visited)
      .map(([section]) => FORM_TABS[section]);

    if (unvisited.length > 0) {
      setUnvisitedSections(unvisited);
      open();
      setLoading(false);
      return;
    }

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
          patientId
        );
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification('Successfully registered patient.');
          navigate(`/patients/${patientId}`, { replace: true });
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
          patientId
        );
        if (updateRes.status === StatusCodes.OK) {
          showSuccessNotification(
            'Patient basic information has been successfully updated.'
          );
          navigate(`/patients/${patientId}`, { replace: true });
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
   * @param {object} errors
   */
  function handleErrors (errors) {
    // Set focus to the first error field
    const firstErrorPath = Object.keys(errors)[0];
    form.getInputNode(firstErrorPath)?.focus();
    setOpenedSection(firstErrorPath.split('.')[0]);

    // Create a message for which sections have errors
    const errorKeys = Object.keys(errors).map((key) => key.split('.')[0]);
    const errorSets = new Set(errorKeys);

    const errorSections = [];
    errorSets.forEach((key) => {
      errorSections.push(FORM_TABS[key]);
    });

    showErrorNotification(
      `Please fix the following sections: ${errorSections.join(', ')}`
    );
  }

  /**
   *
   * @param {object} data
   */
  async function registerOrUpdatePatient (data) {
    try {
      const res = await LifelineAPI.registerPatient(data, patientId);
      if (res.status === StatusCodes.CREATED) {
        setShowCheck((prevShowCheck) => ({
          ...prevShowCheck,
          patientData: true,
        }));
        return;
      }

      if (res.status === StatusCodes.CONFLICT) {
        const updateRes = await LifelineAPI.updatePatient(
          { patientData: data },
          patientId
        );
        if (updateRes.status === StatusCodes.OK) {
          setShowCheck((prevShowCheck) => ({
            ...prevShowCheck,
            patientData: true,
          }));
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
  async function updatePatientRecord (data) {
    try {
      const res = await LifelineAPI.updatePatient(data, patientId);
      if (res.status === StatusCodes.OK) {
        setShowCheck((prevShowCheck) => ({
          ...prevShowCheck,
          [Object.keys(data)[0]]: true,
        }));
        return;
      }
      if (res.status === StatusCodes.BAD_REQUEST) {
        throw new Error('Invalid data provided.');
      }
      if (res.status === StatusCodes.NOT_FOUND) {
        throw new Error(
          'Patient ID not found. Please ensure the Basic Information section is filled out correctly.'
        );
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
  async function handleAccordionChange (value) {
    if (value === null) {
      navigate('', { replace: true });
      return;
    } else {
      navigate(`#${value}`, { replace: true });
    }

    let errorFieldCount = 0;

    if (openedSection === 'codeStatus' && !form.isValid(`${openedSection}`)) {
      errorFieldCount++;
    }

    for (const field in form.getValues()[openedSection]) {
      form.validateField(`${openedSection}.${field}`);
      if (!form.isValid(`${openedSection}.${field}`)) {
        errorFieldCount++;
      }
    }

    if (errorFieldCount === 0) {
      setOpenedSection(value);

      setVisitedSections((prevVisitedSections) => ({
        ...prevVisitedSections,
        [value]: true,
      }));

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

  return (
    <main>
      <Container style={{ marginBottom: '1rem' }}>
        <h1>Register Patient</h1>
        <Flex direction='column' gap='md'>
          <form onSubmit={form.onSubmit(submitPatient, handleErrors)}>
            <Modal
              opened={opened}
              onClose={close}
              title="Some Sections Haven't Been Viewed"
              size='lg'
            >
              <Text>Please verify the sections below:</Text>
              <ul>
                {unvisitedSections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ul>
            </Modal>
            <PatientRegistrationAccordion
              form={form}
              initialMedicalData={initialMedicalData}
              initialHospitalData={initialHospitalData}
              initialPhysicianData={initialPhysicianData}
              openedSection={openedSection}
              showCheck={showCheck}
              handleAccordionChange={handleAccordionChange}
            />
            <Flex justify='center' mt='md'>
              <Button
                onClick={form.onSubmit(submitPatient, handleErrors)}
                color='gray'
                fullWidth
                loading={loading}
                loaderProps={{ type: 'dots' }}
              >
                Register Patient
              </Button>
            </Flex>
          </form>
        </Flex>
      </Container>
    </main>
  );
}
