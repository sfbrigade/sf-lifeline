import {
  Container,
  Group,
  TextInput,
  Divider,
  Pagination,
  LoadingOverlay,
  Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

import { TbSearch as IconSearch } from 'react-icons/tb';

import PatientsTable from './PatientsTable';
import { usePatients } from './usePatients';

/**
 *  Patients page component
 *
 */
export default function Patients () {
  const [inputValue, setInputValue] = useState('');
  const { patients, headers, isFetching, page, pages, setPage, setSearch } =
    usePatients();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Patients
        </Title>
        <TextInput
          leftSectionPointerEvents='none'
          leftSection={<IconSearch />}
          placeholder='Search'
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
            handleSearch(event.currentTarget.value);
          }}
          value={inputValue}
        />
      </Group>
      <Divider mb='xl' />
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <PatientsTable headers={headers} data={patients} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </Container>
  );
}
