import {
  Container,
  LoadingOverlay,
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import classes from './Patients.module.css';
import PatientsTable from './PatientsTable';
import { usePatients } from './usePatients';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const { patients, headers, isFetching } = usePatients();

  return (
    <Container>
      <div className={classes.header}>
        <p className={classes.title}>Patients</p>
        <Group>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={<IconSearch stroke={2} />}
            placeholder="Search"
          />
          <Button variant="default">Renewal Required</Button>
          <Button variant="filled">Create Profile</Button>
        </Group>
      </div>
      <Divider mb="xl" />
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <PatientsTable headers={headers} data={patients} />
    </Container>
  );
}
