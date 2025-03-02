import PropTypes from 'prop-types';

import { Box, Paper, Text, Title } from '@mantine/core';
import { humanize } from 'inflection';

const contactInfoProps = {
  emergencyContact: PropTypes.object,
  physician: PropTypes.object,
};

ContactInfo.propTypes = contactInfoProps;

/**
 *
 * @param {PropTypes.InferProps<typeof contactInfoProps>} props
 */
export default function ContactInfo ({ emergencyContact, physician }) {
  return (
    <Box component='section' mb='md'>
      <Title order={4} mb='xs'>Contact Information</Title>
      <Paper shadow='xs' p='md' radius='md' withBorder>
        <Box component='section' mb='xs'>
          <Title order={5}>
            Emergency Contact
          </Title>
          <Text>
            {(emergencyContact?.firstName || emergencyContact?.lastName)
              ? `${emergencyContact?.firstName || ''} ${emergencyContact?.middleName || ''} ${emergencyContact?.lastName || ''}`
              : '-'}
            {emergencyContact?.relationship &&
              ` (${humanize(emergencyContact?.relationship)})`}
            {emergencyContact?.phone && <><br />{emergencyContact?.phone}</>}
          </Text>
        </Box>
        <Box component='section'>
          <Title order={5}>
            Primary care physician (PCP)
          </Title>
          <Text>
            {physician
              ? `${physician?.firstName} ${physician?.lastName}`
              : '-'}
            {physician?.phone && <><br />{physician?.phone}</>}
            {physician?.hospitals[0]?.name && <><br />{physician?.hospitals[0]?.name}</>}
          </Text>
        </Box>
      </Paper>
    </Box>
  );
}
