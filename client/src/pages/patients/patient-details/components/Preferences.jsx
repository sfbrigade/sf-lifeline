import PropTypes from 'prop-types';
import { Paper, Text } from '@mantine/core';
import classes from '../PatientDetails.module.css';
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
    <section>
      <Text className={classes.sectionTitle}>Preferences</Text>
      <Paper shadow='xs' p='md' radius='md' withBorder>
        <section>
          <Text className={classes.boldText}>Code status</Text>
          <Text>{codeStatus ? humanize(codeStatus) : 'Not provided'}</Text>
          <Text className={classes.boldText}>Hospital</Text>
          <Text>{hospital ? hospital.name : 'Not provided'}</Text>
        </section>
      </Paper>
    </section>
  );
}
