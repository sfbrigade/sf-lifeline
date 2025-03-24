import {
  Container,
  Group,
  TextInput,
  Divider,
  Pagination,
  LoadingOverlay,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

import { TbSearch as IconSearch } from 'react-icons/tb';
import { useHospitals } from './useHospital';
import HospitalTable from './HospitalTable';

/**
 *  Physicians page component
 *
 */
export default function Hospital ({ physicansId }) {
  const [inputValue, setInputValue] = useState('');
  const { hospitals, headers, isFetching, page, pages, setPage, setSearch } = useHospitals(physicansId);

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <TextInput
          leftSectionPointerEvents='none'
          leftSection={<IconSearch stroke={2} />}
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
      <HospitalTable headers={headers} hospitals={hospitals} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </Container>
  );
}
