import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { Table, Menu, ActionIcon } from '@mantine/core';
import {
  IconDotsVertical,
  IconUser,
  IconQrcode,
  IconTrash,
} from '@tabler/icons-react';

const patientTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    }),
  ),
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedBy: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }),

  onDelete: PropTypes.func.isRequired,
  showDeleteMenu: PropTypes.bool.isRequired,
};

/**
 * Patient table row component
 * @param {PropTypes.InferProps<typeof patientTableRowProps>} props
 */
export default function PatientTableRow({
  headers,
  patient,
  onDelete,
  showDeleteMenu,
}) {
  return (
    <Table.Tr key={patient.id}>
      {headers.map((header) => (
        <Table.Td key={patient[header.key] + header.key}>
          {patient[header.key]}
        </Table.Td>
      ))}
      <Table.Td>
        <Menu shadow="md">
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
            {showDeleteMenu && (
              <Menu.Item
                leftSection={<IconTrash size={18} />}
                color="red"
                onClick={() =>
                  onDelete({
                    id: patient.id,
                    name: patient.name,
                  })
                }
              >
                Delete
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}

PatientTableRow.propTypes = patientTableRowProps;
