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

import PhysiciansTable from './PhysiciansTable';
import { usePhysicians } from './usePhysicians';

/**
 *  Physicians page component
 *
 */
export default function Physicians () {
  const [inputValue, setInputValue] = useState('');
  const { physicians, headers, isFetching, page, pages, setPage, setSearch } = usePhysicians();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Physicians
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
      <PhysiciansTable headers={headers} data={physicians} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </Container>
  );
}
