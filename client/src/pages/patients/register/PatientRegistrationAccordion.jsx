import PropTypes from 'prop-types';

import { Accordion, TextInput, Select, InputBase } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IMaskInput } from 'react-imask';
import MedicalDataSearch from './inputs/MedicalDataSearch';
import HealthcareChoicesSearch from './inputs/HealthcareChoicesSearch';

import classes from './PatientRegistationAccordion.module.css';

const PatientRegistrationAccordionProps = {
  form: PropTypes.object.isRequired,
  openedSection: PropTypes.string,
  handleAccordionChange: PropTypes.func.isRequired,
  initialMedicalData: PropTypes.object,
  initialHospitalData: PropTypes.object,
  initialPhysicianData: PropTypes.object,
};

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
          <Accordion.Control>&#9312; Basic Information</Accordion.Control>
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
              searchable
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
          <Accordion.Control>&#9313; Emergency Contact</Accordion.Control>
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
              data={[
                'SPOUSE',
                'PARENT',
                'CHILD',
                'SIBLING',
                'OTHER',
                'UNKNOWN',
              ]}
              searchable
              key={form.key('contactData.relationship')}
              {...form.getInputProps('contactData.relationship')}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="medicalData">
          <Accordion.Control>&#9314; Medical Information</Accordion.Control>
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
          <Accordion.Control>&#9315; Healthcare Choices</Accordion.Control>
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
          <Accordion.Control>&#9316; Advanced Directive</Accordion.Control>
          <Accordion.Panel>
            <Select
              label="Code Status"
              placeholder="Select Code Status"
              data={['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL']}
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
