import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
  TbQrcode as IconQrcode,
  TbTrash as IconTrash,
} from 'react-icons/tb';
import TableMenu from '../../components/DataTable/TableMenu';

const physiciansTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  physicians: PropTypes.shape({
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
 * @param {PropTypes.InferProps<typeof physiciansTableRowProps>} props
 */
export default function PhysiciansTableRow ({
  headers,
  patient,
  onDelete,
  showDeleteMenu,
}) {
  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/Physicians/${patient.id}`,
      component: Link,
    },
    {
      icon: <IconQrcode size={18} />,
      label: 'Reprint QR Code',
      onClick: () => { /* implement QR code logic */ },
    },
  ];

  if (showDeleteMenu) {
    menuItems.push({
      icon: <IconTrash size={18} />,
      label: 'Delete',
      color: 'red',
      onClick: () => onDelete({ id: patient.id, name: patient.name }),
    });
  }

  return (
    <Table.Tr key={patient.id}>
      {headers.map((header) => (
        <Table.Td key={patient[header.key] + header.key}>
          {patient[header.key]}
        </Table.Td>
      ))}
      <Table.Td>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

PhysiciansTableRow.propTypes = physiciansTableRowProps;
