import PropTypes from 'prop-types';
import { Box, Paper, Text, Title } from '@mantine/core';

import { humanize } from 'inflection';
const preferencesProps = {
  codeStatus: PropTypes.string,
  hospital: PropTypes.object,
};

Preferences.propTypes = preferencesProps;

/**
 * Preferences section of patient details
 * @param {PropTypes.InferProps<typeof preferencesProps>} props
 */
export default function Preferences ({ codeStatus, hospital }) {
  return (
    <Box component='section' mb='md'>
      <Title order={4} mb='xs'>Preferences</Title>
      <Paper shadow='xs' p='md' radius='md' withBorder>
        <section>
          <Title order={5}>Code status</Title>
          <Text mb='xs'>{codeStatus ? humanize(codeStatus) : 'Not provided'}</Text>
          <Title order={5}>Hospital</Title>
          <Text mb='xs'>{hospital ? hospital.name : 'Not provided'}</Text>
        </section>
      </Paper>
    </Box>
  );
}
