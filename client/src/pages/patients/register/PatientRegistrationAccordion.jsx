import PropTypes from 'prop-types';

import { Accordion, TextInput, NativeSelect, Stack, InputBase } from '@mantine/core';
import { TbCircleCheck as IconCircleCheck } from 'react-icons/tb';
import { IMaskInput } from 'react-imask';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { useAppContext } from '#app/AppContext';

import MedicalDataSearch from './inputs/MedicalDataSearch';
import HealthcareChoicesSearch from './inputs/HealthcareChoicesSearch';

import classes from './PatientRegistrationAccordion.module.css';

const PatientRegistrationAccordionProps = {
  form: PropTypes.object.isRequired,
  initialMedicalData: PropTypes.object,
  initialHospitalData: PropTypes.string,
  initialPhysicianData: PropTypes.string,
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
 *  Patient Registration Accordion component
 * @param {PropTypes.InferProps<typeof PatientRegistrationAccordionProps>} props
 */
export default function PatientRegistrationAccordion ({
  form,
  initialMedicalData,
  initialHospitalData,
  initialPhysicianData,
  openedSection,
  showCheck,
  handleAccordionChange,
}) {
  const { env } = useAppContext();
  const { t } = useTranslation();

  return (
    <Accordion
      defaultValue='patientData'
      value={openedSection}
      onChange={handleAccordionChange}
      classNames={classes}
    >
      <Accordion.Item value='patientData'>
        <Accordion.Control chevron={false}>
          &#9312; Basic Information{' '}
          {showCheck['patientData']
            ? (
              <IconCircleCheck color='green' size={30} />
              )
            : null}
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {env.FEATURE_COLLECT_PHI &&
              <>
                <TextInput
                  label='First Name'
                  placeholder='First Name'
                  withAsterisk
                  key={form.key('patientData.firstName')}
                  {...form.getInputProps('patientData.firstName')}
                />
                <TextInput
                  label='Middle Name'
                  placeholder='Middle Name'
                  key={form.key('patientData.middleName')}
                  {...form.getInputProps('patientData.middleName')}
                />
                <TextInput
                  label='Last Name'
                  placeholder='Last Name'
                  withAsterisk
                  key={form.key('patientData.lastName')}
                  {...form.getInputProps('patientData.lastName')}
                />
                <NativeSelect
                  label='Gender'
                  withAsterisk
                  data={FORM_SELECT_ENUM_VALUES.gender.map((value) => ({
                    value,
                    label: t(`Gender.${value}`),
                  }))}
                  key={form.key('patientData.gender')}
                  {...form.getInputProps('patientData.gender')}
                />
              </>}
            <NativeSelect
              label='Language'
              withAsterisk
              data={FORM_SELECT_ENUM_VALUES.language.map((value) => ({
                value,
                label: t(`Language.${value}`),
              }))}
              key={form.key('patientData.language')}
              {...form.getInputProps('patientData.language')}
            />
            {env.FEATURE_COLLECT_PHI &&
              <TextInput
                type='date'
                label='Date of Birth'
                withAsterisk
                max={dayjs().format('YYYY-MM-DD')}
                key={form.key('patientData.dateOfBirth')}
                {...form.getInputProps('patientData.dateOfBirth')}
              />}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      {env.FEATURE_COLLECT_PHI &&
        <Accordion.Item value='contactData'>
          <Accordion.Control>
            &#9313; Emergency Contact{' '}
            {showCheck['contactData']
              ? (
                <IconCircleCheck color='green' size={30} />
                )
              : null}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <TextInput
                label='First Name'
                placeholder='First Name'
                key={form.key('contactData.firstName')}
                {...form.getInputProps('contactData.firstName')}
              />
              <TextInput
                label='Middle Name'
                placeholder='Middle Name'
                key={form.key('contactData.middleName')}
                {...form.getInputProps('contactData.middleName')}
              />
              <TextInput
                label='Last Name'
                placeholder='Last Name'
                key={form.key('contactData.lastName')}
                {...form.getInputProps('contactData.lastName')}
              />
              <InputBase
                label='Phone Number'
                component={IMaskInput}
                mask='(000) 000-0000'
                placeholder='(000) 000-0000'
                key={form.key('contactData.phone')}
                {...form.getInputProps('contactData.phone')}
              />
              <TextInput
                label='Email'
                placeholder='Email'
                key={form.key('contactData.email')}
                {...form.getInputProps('contactData.email')}
              />
              <NativeSelect
                label='Relationship'
                placeholder='Select Relationship'
                data={FORM_SELECT_ENUM_VALUES.relationship.map((value) => ({
                  value,
                  label: t(`Relationship.${value}`),
                }))}
                key={form.key('contactData.relationship')}
                {...form.getInputProps('contactData.relationship')}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>}

      <Accordion.Item value='medicalData'>
        <Accordion.Control>
          {env.FEATURE_COLLECT_PHI ? <>&#9314;</> : <>&#9313;</>} Medical Information{' '}
          {showCheck['medicalData']
            ? (
              <IconCircleCheck color='green' size={30} />
              )
            : null}
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {Object.keys(form.getValues().medicalData).map((category) => {
              return (
                <MedicalDataSearch
                  category={category}
                  form={form}
                  initialMedicalData={initialMedicalData[category] || []}
                  key={category}
                />
              );
            })}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value='healthcareChoices'>
        <Accordion.Control>
          {env.FEATURE_COLLECT_PHI ? <>&#9315;</> : <>&#9314;</>} Healthcare Choices{' '}
          {showCheck['healthcareChoices']
            ? (
              <IconCircleCheck color='green' size={30} />
              )
            : null}
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <HealthcareChoicesSearch
              form={form}
              choice='hospital'
              initialData={initialHospitalData}
            />
            <HealthcareChoicesSearch
              form={form}
              choice='physician'
              initialData={initialPhysicianData}
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value='codeStatus'>
        <Accordion.Control>
          {env.FEATURE_COLLECT_PHI ? <>&#9316;</> : <>&#9315;</>} Advanced Directive{' '}
          {showCheck['codeStatus']
            ? (
              <IconCircleCheck color='green' size={30} />
              )
            : null}
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <NativeSelect
              label='Code Status'
              placeholder='Select Code Status'
              data={FORM_SELECT_ENUM_VALUES.codeStatus.map((value) => ({
                value,
                label: t(`CodeStatus.${value}`),
              }))}
              key={form.key('codeStatus')}
              {...form.getInputProps('codeStatus')}
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

PatientRegistrationAccordion.propTypes = PatientRegistrationAccordionProps;
