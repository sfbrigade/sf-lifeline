import PropTypes from 'prop-types';

import { Paper, Text } from '@mantine/core';
import { humanize } from 'inflection';
import classes from '../PatientDetails.module.css';

const contactInfoProps = {
  emergencyContact: PropTypes.object,
  physician: PropTypes.object,
};

ContactInfo.propTypes = contactInfoProps;

/**
 *
 * @param {PropTypes.InferProps<typeof contactInfoProps>} props
 */
export default function ContactInfo({ emergencyContact, physician }) {
  return (
    <section>
      <Text className={classes.sectionTitle}> Contact Information</Text>
      <Paper shadow="xs" p="md" radius="md" withBorder>
        <div className={classes.titleRow}>
          <Text className={classes.contactInfoColumnTitle}>
            Emergency Contact
          </Text>
          <Text className={classes.contactInfoColumnTitle}>
            Primary care physician (PCP) contact
          </Text>
        </div>
        <div className={classes.twoColumnGrid}>
          <section>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Name</Text>
              <Text>
                {emergencyContact?.firstName}
                {emergencyContact?.lastName}
              </Text>
            </div>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Phone</Text>
              <Text>{emergencyContact?.phone}</Text>
            </div>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Relationship</Text>
              <Text>
                {emergencyContact && humanize(emergencyContact?.relationship)}
              </Text>
            </div>
          </section>
          <section>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Name</Text>
              <Text>
                {physician?.firstName} {physician?.lastName}
              </Text>
            </div>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Phone</Text>
              <Text>{physician?.phone}</Text>
            </div>
            <div className={classes.contactRow}>
              <Text className={classes.boldText}>Hospital</Text>
              <Text>{physician?.hospitals[0]?.name}</Text>
            </div>
          </section>
        </div>
      </Paper>
    </section>
  );
}
