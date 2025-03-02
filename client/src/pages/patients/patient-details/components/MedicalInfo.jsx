import PropTypes from 'prop-types';

import { Box, Paper, Text, Title, Pill } from '@mantine/core';

const medicalInfoProps = {
  allergies: PropTypes.array,
  medications: PropTypes.array,
  conditions: PropTypes.array,
};

MedicalInfo.propTypes = medicalInfoProps;

/**
 *
 * @param {PropTypes.InferProps<typeof medicalInfoProps>} props
 */
export default function MedicalInfo ({ allergies, medications, conditions }) {
  return (
    <Box component='section' mb='md'>
      <Title order={4} mb='xs'>Medical Information</Title>
      <Paper shadow='xs' p='md' radius='md' withBorder>
        <Box component='section' mb='xs'>
          <Title order={5} mb='xs'>Allergies</Title>
          {allergies.length === 0
            ? (
              <Text>None</Text>
              )
            : (
                allergies.map((entry) => (
                  <Pill
                    size='md'
                    key={entry.allergy.id}
                    me='xs'
                    mb='xs'
                  >
                    {entry.allergy.name}
                  </Pill>
                ))
              )}
        </Box>
        <Box component='section' mb='xs'>
          <Title order={5} mb='xs'>Medications</Title>
          {medications.length === 0
            ? (
              <Text>None</Text>
              )
            : (
                medications.map((entry) => (
                  <Pill
                    size='md'
                    key={entry.medication.id}
                    me='xs'
                    mb='xs'
                  >
                    {entry.medication.name}
                  </Pill>
                ))
              )}
        </Box>
        <Box component='section'>
          <Title order={5} mb='xs'>Conditions</Title>
          {conditions?.length === 0
            ? (
              <Text>None</Text>
              )
            : (
                conditions.map((entry) => (
                  <Pill
                    size='md'
                    key={entry.condition.id}
                    me='xs'
                    mb='xs'
                  >
                    {entry.condition.name}
                  </Pill>
                ))
              )}
        </Box>
      </Paper>
    </Box>
  );
}
