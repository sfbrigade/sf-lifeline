import {
  Container,
  Group,
  TextInput,
  Button,
  Divider,
  Pagination,
  LoadingOverlay,
  Title,
} from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import { TbSearch as IconSearch } from 'react-icons/tb';

import HospitalsTable from './HospitalsTable';
import { useHospitals } from './useHospitals';
import HospitalModal from './HospitalModal';

/**
 *  Hosptials page component
 *
 */
export default function Hospitals () {
  const [inputValue, setInputValue] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const { hospitals, headers, isFetching, page, pages, setPage, setSearch } = useHospitals();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <HospitalModal opened={opened} close={close} />
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Hospitals
        </Title>
        <Group>
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
          <Button variant='filled' onClick={open}>
            Create Hospital
          </Button>
        </Group>
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
