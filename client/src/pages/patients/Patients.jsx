import {
  Table,
  Container,
  LoadingOverlay,
  Paper,
  Menu,
  ActionIcon,
  rem,
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StatusCodes } from 'http-status-codes';
import { IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import classes from './Patients.module.css';
import LifelineAPI from './LifelineAPI';

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
      <Paper withBorder>
        <Table
          stickyHeader
          highlightOnHover
          verticalSpacing="lg"
          classNames={{ table: classes.table }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Created by</Table.Th>
              <Table.Th>Date created</Table.Th>
              <Table.Th>Updated by</Table.Th>
              <Table.Th>Last updated</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {patients?.map((patient) => (
              <Table.Tr key={patient.id}>
                <Table.Td>
                  {patient.firstName}{' '}
                  {patient.middleName ? patient.middleName + ' ' : ''}
                  {patient.lastName}
                </Table.Td>
                <Table.Td>
                  {patient.createdBy.firstName}{' '}
                  {patient.createdBy.middleName
                    ? patient.createdBy.middleName + ' '
                    : ''}
                  {patient.createdBy.lastName}
                </Table.Td>
                <Table.Td>
                  {new Date(patient.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Table.Td>
                <Table.Td>
                  {patient.createdBy.firstName}{' '}
                  {patient.createdBy.middleName
                    ? patient.createdBy.middleName + ' '
                    : ''}
                  {patient.createdBy.lastName}
                </Table.Td>
                <Table.Td>
                  {new Date(patient.updatedAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Table.Td>
                <Table.Td>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical
                          style={{ width: rem(18), height: rem(18) }}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        component={Link}
                        to={`/patients/${patient.id}`}
                      >
                        View/Edit
                      </Menu.Item>
                      <Menu.Item>Reprint QR Code</Menu.Item>
                      <Menu.Item color="red">Delete</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}
