import {
  Group,
  TextInput,
  Pagination,
  LoadingOverlay,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

import { TbSearch as IconSearch } from 'react-icons/tb';
import { usePhysicanPatients } from './usePhysicanPatients';
import PatientsTable from './PhysicanPatientsTable';

/**
 *  PhysicanPatients page component
 *
 */
export default function PhysicanPatients ({ physicansId }) {
  const [inputValue, setInputValue] = useState('');
  const { patients, headers, isFetching, page, pages, setPage, setSearch } = usePhysicanPatients(physicansId);

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <>
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
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <PatientsTable headers={headers} patients={patients} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </>
  );
}
