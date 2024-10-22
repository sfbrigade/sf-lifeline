import {
  Container,
  LoadingOverlay,
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StatusCodes } from 'http-status-codes';
import { IconSearch } from '@tabler/icons-react';

import classes from './Patients.module.css';
import LifelineAPI from './LifelineAPI';
import PatientsTable from './PatientsTable';

const HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'createdBy', text: 'Created by' },
  { key: 'createdAt', text: 'Date created' },
  { key: 'updatedBy', text: 'Updated by' },
  { key: 'updatedAt', text: 'Last updated' },
  { key: 'more', text: '' },
];

/**
 *  Patients page component
 *
 */
export default function Patients() {
  const [search] = useState('');
  const [page] = useState(1);

  const { data: patients, isFetching } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getPatients(search, page);
      if (res.status === StatusCodes.OK) {
        return await res.json();
      } else {
        throw new Error('Failed to fetch patients.');
      }
    },
  });

  let formattedData = [];
  if (patients) {
    formattedData = patients.map((patient) => {
      return {
        id: patient.id,
        name: `${patient.firstName}${patient.middleName ? ` ${patient.middleName}` : ''} ${patient.lastName}`,
        createdBy: `${patient.createdBy.firstName}${patient.createdBy.middleName ? patient.createdBy.middleName + ' ' : ''}${patient.createdBy.lastName}`,
        createdAt: new Date(patient.createdAt).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        updatedBy: `${patient.createdBy.firstName}${patient.createdBy.middleName ? patient.createdBy.middleName + ' ' : ''}${patient.createdBy.lastName}`,
        updatedAt: new Date(patient.updatedAt).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });
  }

  return (
    <Container>
      <div className={classes.header}>
        <p className={classes.title}>Patients</p>
        <Group>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={<IconSearch stroke={2} />}
            placeholder="Search"
          />
          <Button variant="default">Renewal Required</Button>
          <Button variant="filled">Create Profile</Button>
        </Group>
      </div>
      <Divider mb="xl" />
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <PatientsTable headers={HEADERS} data={formattedData} />
    </Container>
  );
}
