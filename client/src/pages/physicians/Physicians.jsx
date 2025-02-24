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

import { TbSearch as IconSearch } from 'react-icons/tb';

import classes from './Physicians.module.css';
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
      <div className={classes.header}>
        <Text fw={600} size='xl' mr='md'>
          Physicians
        </Text>
        <Group>
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
      </div>
      <Divider mb='xl' />
      <Container className={classes.physiciansContainer}>
        <LoadingOverlay
          visible={isFetching}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <PhysiciansTable headers={headers} data={physicians} />
        <Pagination total={pages} value={page} onChange={setPage} />
      </Container>
    </Container>
  );
}
