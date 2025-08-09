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

import { TbSearch as IconSearch } from 'react-icons/tb';

import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import AllergiesTable from './AllergiesTable';
import { useAllergies } from './useAllergies';
import AllergyModal from './AllergyModal';

export default function Allergies () {
  const [inputValue, setInputValue] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const { allergies, headers, isFetching, page, pages, setPage, setSearch } = useAllergies();
  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);
  return (
    <Container>
      <AllergyModal opened={opened} close={close} />
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Allergies
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
            Create Allergy
          </Button>
        </Group>
      </Group>
      <Divider mb='xl' />
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <AllergiesTable headers={headers} data={allergies} />
      <Pagination total={pages} value={page} onChange={setPage} />
    </Container>
  );
}
