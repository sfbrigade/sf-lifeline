import { Paper, Table, ActionIcon, Menu } from '@mantine/core';
import {
  IconDotsVertical,
  IconUser,
  IconQrcode,
  IconTrash,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from './Patients.module.css';

export default function PatientsTable({ headers, data }) {
  return (
    <Paper withBorder>
      <Table
        stickyHeader
        highlightOnHover
        verticalSpacing="lg"
        classNames={{ table: classes.table }}
      >
        <Table.Thead>
          <Table.Tr>
            {headers.map((header) => (
              <Table.Th key={header.key}>{header.text}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.map((patient) => (
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
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconUser size={18} />}
                      component={Link}
                      to={`/patients/${patient.id}`}
                    >
                      View/Edit
                    </Menu.Item>
                    <Menu.Item leftSection={<IconQrcode size={18} />}>
                      Reprint QR Code
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={18} />}
                      color="red"
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
