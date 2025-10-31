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

import PatientsTable from './PatientsTable';
import { usePatients } from './usePatients';
import LifelineAPI from '#app/LifelineAPI';

/**
 *  Patients page component
 *
 */
export default function Patients () {
  const [inputValue, setInputValue] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { patients, headers, isFetching, page, pages, setPage, setSearch } =
    usePatients();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  async function handleCreatePatient () {
    try {
      setCreating(true);
      // Keep trying until we successfully create a patient
      // Collisions are retried transparently.

      while (true) {
        // Ask server for a guaranteed-unique patient URL, extract the UUID
        const genRes = await fetch('/api/v1/patients/generate?count=1');
        if (!genRes.ok) throw new Error('Failed to generate patient ID');
        const [url] = await genRes.json();
        const id = url.split('/').pop();

        // Create the new patient with the generated ID
        const res = await LifelineAPI.registerPatient({}, id);
        if (res.status === StatusCodes.CREATED) {
          navigate(`/patients/${id}/edit`);
          return;
        }
        // If by chance the ID already exists, try again with a new one
        if (res.status === StatusCodes.CONFLICT) {
          continue;
        }
        if (res.status === StatusCodes.BAD_REQUEST) {
          // Treat BAD_REQUEST as a hard error
          throw new Error('Invalid patient ID. Please try again.');
        }
        // For any other status, retry creating with a new ID
        continue;
      }
    } catch (err) {
      console.error(err);
      // Basic alert for now; can be replaced with notifications UI
      alert(err.message || 'Unable to create patient');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Container>
      <Group justify='space-between' wrap='nowrap' my='sm'>
        <Title order={3} mr='md'>
          Patients
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
          <Button variant='filled' onClick={handleCreatePatient} loading={creating} loaderProps={{ type: 'dots' }}>
            Create Patient
          </Button>
        </Group>
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
