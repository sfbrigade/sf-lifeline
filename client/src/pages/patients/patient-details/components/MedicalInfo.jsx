import PropTypes from 'prop-types';

import { Paper, Text, Pill } from '@mantine/core';
import classes from '../PatientDetails.module.css';

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
export default function MedicalInfo({ allergies, medications, conditions }) {
  return (
    <section>
      <Text className={classes.sectionTitle}>Medical Information</Text>
      <Paper shadow="xs" p="md" radius="md" withBorder>
        <section>
          <Text className={classes.boldText}>Allergies</Text>
          {allergies.length === 0 ? (
            <Text>None</Text>
          ) : (
            allergies.map((entry) => (
              <Pill
                size="md"
                key={entry.allergy.id}
                className={classes.medicalInfoPills}
              >
                {entry.allergy.name}
              </Pill>
            ))
          )}
        </section>
        <section>
          <Text className={classes.boldText}>Medications</Text>
          {medications.length === 0 ? (
            <Text>None</Text>
          ) : (
            medications.map((entry) => (
              <Pill
                size="md"
                key={entry.medication.id}
                className={classes.medicalInfoPills}
              >
                {entry.medication.name}
              </Pill>
            ))
          )}
        </section>
        <section>
          <Text className={classes.boldText}>Conditions</Text>
          {conditions?.length === 0 ? (
            <Text>None</Text>
          ) : (
            <ul>
              {conditions.map((entry) => (
                <li key={entry.condition.id}>{entry.condition.name}</li>
              ))}
            </ul>
          )}
        </section>
      </Paper>
    </section>
  );
}
