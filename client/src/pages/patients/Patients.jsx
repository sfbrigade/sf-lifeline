import {
  Container,
  Group,
  TextInput,
  Divider,
  Pagination,
  LoadingOverlay,
  Text,
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
  const [inputValue, setInputValue] = useState('');
  const { patients, headers, isFetching, page, pages, setPage, setSearch } =
    usePatients();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <div className={classes.header}>
      <Text fw={600} size="xl" mr="md">
          Patients
        </Text>
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
        </Group>
      </div>
      <Divider mb="xl" />
      <Container className={classes.patientsContainer}>
        <LoadingOverlay
          visible={isFetching}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <PatientsTable headers={headers} data={patients} />
        <Pagination total={pages} value={page} onChange={setPage} />
      </Container>
    </Container>
  );
}
