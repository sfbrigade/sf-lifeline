import PropTypes from 'prop-types';

import { Accordion, TextInput, Select, InputBase } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCircleCheck } from '@tabler/icons-react';
import { IMaskInput } from 'react-imask';
import MedicalDataSearch from './inputs/MedicalDataSearch';
import HealthcareChoicesSearch from './inputs/HealthcareChoicesSearch';

import classes from './PatientRegistationAccordion.module.css';

const PatientRegistrationAccordionProps = {
  form: PropTypes.object.isRequired,
  initialMedicalData: PropTypes.object,
  initialHospitalData: PropTypes.object,
  initialPhysicianData: PropTypes.object,
  openedSection: PropTypes.string,
  showCheck: PropTypes.object.isRequired,
  handleAccordionChange: PropTypes.func.isRequired,
};

const FORM_SELECT_ENUM_VALUES = {
  language: [
    'CANTONESE',
    'ENGLISH',
    'MANDARIN',
    'RUSSIAN',
    'SPANISH',
    'TAGALOG',
  ],
  gender: ['FEMALE', 'MALE', 'TRANS_MALE', 'TRANS_FEMALE', 'OTHER', 'UNKNOWN'],
  relationship: ['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'OTHER', 'UNKNOWN'],
  codeStatus: ['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL'],
};

/**
 * Converts a string to title case
 * @param {string} string 
 * @returns {string}
 */
function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 *  Patient Registration Accordion component
 * @param {PropTypes.InferProps<typeof PatientRegistrationAccordionProps>} props
 */
export default function PatientRegistrationAccordion({
  form,
  initialMedicalData,
  initialHospitalData,
  initialPhysicianData,
  openedSection,
  showCheck,
  handleAccordionChange,
}) {
  return (
    <>
      <Accordion
        defaultValue="patientData"
        value={openedSection}
        onChange={handleAccordionChange}
        classNames={classes}
      >
        <Accordion.Item value="patientData">
          <Accordion.Control chevron={false}>
            &#9312; Basic Information{' '}
            {showCheck['patientData'] ? (
              <IconCircleCheck color="green" size={30} />
            ) : null}
          </Accordion.Control>
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
              data={FORM_SELECT_ENUM_VALUES.gender.map((value) => ({
                value,
                label: toTitleCase(value),
              }))}
              searchable
              key={form.key('patientData.gender')}
              {...form.getInputProps('patientData.gender')}
            />
            <Select
              label="Language"
              placeholder="Select Language"
              withAsterisk
              data={FORM_SELECT_ENUM_VALUES.language.map((value) => ({
                value,
                label: toTitleCase(value),
              }))}
              searchable
              key={form.key('patientData.language')}
              {...form.getInputProps('patientData.language')}
            />
            <DateInput
              label="Date of Birth"
              valueFormat="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              defaultLevel="decade"
              maxDate={new Date()}
              withAsterisk
              key={form.key('patientData.dateOfBirth')}
              {...form.getInputProps('patientData.dateOfBirth')}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="contactData">
          <Accordion.Control>
            &#9313; Emergency Contact{' '}
            {showCheck['contactData'] ? (
              <IconCircleCheck color="green" size={30} />
            ) : null}
          </Accordion.Control>
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
            <InputBase
              label="Phone Number"
              component={IMaskInput}
              mask="(000)-000-0000"
              placeholder="(000)-000-0000"
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
              data={FORM_SELECT_ENUM_VALUES.relationship.map((value) => ({
                value,
                label: toTitleCase(value),
              }))}
              searchable
              key={form.key('contactData.relationship')}
              {...form.getInputProps('contactData.relationship')}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="medicalData">
          <Accordion.Control>
            &#9314; Medical Information{' '}
            {showCheck['medicalData'] ? (
              <IconCircleCheck color="green" size={30} />
            ) : null}
          </Accordion.Control>
          <Accordion.Panel>
            {Object.keys(form.getValues().medicalData).map((category) => {
              return (
                <MedicalDataSearch
                  category={category}
                  form={form}
                  initialMedicalData={initialMedicalData[category]}
                  key={category}
                />
              );
            })}
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="healthcareChoices">
          <Accordion.Control>
            &#9315; Healthcare Choices{' '}
            {showCheck['healthcareChoices'] ? (
              <IconCircleCheck color="green" size={30} />
            ) : null}
          </Accordion.Control>
          <Accordion.Panel>
            <HealthcareChoicesSearch
              form={form}
              choice="hospital"
              initialData={initialHospitalData}
            />
            <HealthcareChoicesSearch
              form={form}
              choice="physician"
              initialData={initialPhysicianData}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="codeStatus">
          <Accordion.Control>
            &#9316; Advanced Directive{' '}
            {showCheck['codeStatus'] ? (
              <IconCircleCheck color="green" size={30} />
            ) : null}
          </Accordion.Control>
          <Accordion.Panel>
            <Select
              label="Code Status"
              placeholder="Select Code Status"
              data={FORM_SELECT_ENUM_VALUES.codeStatus.map((value) => ({
                value,
                label: toTitleCase(value),
              }))}
              searchable
              key={form.key('codeStatus')}
              {...form.getInputProps('codeStatus')}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

PatientRegistrationAccordion.propTypes = PatientRegistrationAccordionProps;
