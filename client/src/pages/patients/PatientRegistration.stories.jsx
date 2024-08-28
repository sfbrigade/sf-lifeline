import { useState } from "react";
import PatientRegistrationAccordion from "./PatientRegistrationAccordion";

import '@mantine/core/styles.css';

export default {
  title: 'Patient Registration Accordion',
  component: PatientRegistrationAccordion,
  tags: ['autodocs'],
  parameters : {
    layout: 'fullscreen'
  },
};

export const Default = {
  args: {
    form: {
      getValues: () => ({
        patientData: {
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'Male',
          language: 'English',
          dateOfBirth: '1990-01-01',
        },
        contactData: {
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          phone: '1234567890',
          email: 'john.doe@example.com',
          relationship: 'Father',
        },
        medicalData: {
          allergies: [],
          medications: [],
          conditions: [],
        },
        healthcareChoices: {
          hospitalId: '1',
          physicianId: '1',
        },
        codeStatus: 'Active',
      }),
      getInputProps: () => ({}),
      isValid: () => true,
      key: () => 'patientData',
      validateField: () => true,
    },
    openedSection: 'patientData',
    handleAccordionChange: (value) => {},
  },
};  


