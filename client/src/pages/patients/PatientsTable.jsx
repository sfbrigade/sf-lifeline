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
              {headers.map((header) => (
                <Table.Td key={patient[header.key]}>
                  {patient[header.key]}
                </Table.Td>
              ))}
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
