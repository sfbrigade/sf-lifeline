import { Table, Container, LoadingOverlay, Paper, Menu, ActionIcon, rem } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StatusCodes } from 'http-status-codes';
import {IconDotsVertical} from '@tabler/icons-react';

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
      <h1>Patients</h1>

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
                        <IconDotsVertical style={{ width: rem(14), height: rem(14) }} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item>Edit</Menu.Item>
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
