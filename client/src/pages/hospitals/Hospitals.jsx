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

import HospitalsTable from './HospitalsTable';
import { useHospitals } from './useHospitals';

/**
 *  Hosptials page component
 *
 */
export default function Hospitals () {
  const [inputValue, setInputValue] = useState('');
  const { hospitals, headers, isFetching, page, pages, setPage, setSearch } = useHospitals();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Hospitals
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
      <HospitalsTable headers={headers} data={hospitals} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </Container>
  );
}
