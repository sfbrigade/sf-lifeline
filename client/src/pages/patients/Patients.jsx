import {
  Container,
  LoadingOverlay,
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

import { IconSearch } from '@tabler/icons-react';

import classes from './Patients.module.css';
import PatientsTable from './PatientsTable';
import { usePatients } from './usePatients';

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const { patients, headers, isFetching, setSearch } = usePatients();

  const [inputValue, setInputValue] = useState('');

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <div className={classes.header}>
        <p className={classes.title}>Patients</p>
        <Group>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={<IconSearch stroke={2} />}
            placeholder="Search"
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              handleSearch(event.currentTarget.value);
            }}
            value={inputValue}
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
