import {
  Container,
  Group,
  TextInput,
  Divider,
  Pagination,
  LoadingOverlay,
  Title,
  Button,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { StatusCodes } from 'http-status-codes';

import { TbSearch as IconSearch } from 'react-icons/tb';

import PhysiciansTable from './PhysiciansTable';
import { usePhysicians } from './usePhysicians';
import LifelineAPI from '#app/LifelineAPI';

/**
 *  Physicians page component
 *
 */
export default function Physicians () {
  const [inputValue, setInputValue] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { physicians, headers, isFetching, page, pages, setPage, setSearch } = usePhysicians();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  async function handleCreatePhysician () {
    try {
      setCreating(true);
      const res = await LifelineAPI.registerPhysician({});
      if (res.status === StatusCodes.CREATED) {
        const physician = await res.json();
        navigate(`/physicians/${physician.id}/edit`);
        return;
      }

      let message = 'Unable to create physician';
      try {
        const data = await res.json();
        if (data?.message) {
          message = data.message;
        }
      } catch (error) {
        // Swallow JSON parsing errors since we already have a default message
      }

      throw new Error(message);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Unable to create physician');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Physicians
        </Title>
        <Group gap='sm' wrap='nowrap'>
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
          <Button
            variant='filled'
            onClick={handleCreatePhysician}
            loading={creating}
            loaderProps={{ type: 'dots' }}
          >
            Create Physician
          </Button>
        </Group>
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
