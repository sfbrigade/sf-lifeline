import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
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
    // createdBy: PropTypes.string.isRequired,
    // createdAt: PropTypes.string.isRequired,
    // updatedBy: PropTypes.string.isRequired,
    // updatedAt: PropTypes.string.isRequired,
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
  physicians,
  onDelete,
  showDeleteMenu,
}) {
  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/physicians/${physicians.id}`,
      component: Link,
    }
  ];

  if (showDeleteMenu) {
    menuItems.push({
      icon: <IconTrash size={18} />,
      label: 'Delete',
      color: 'red',
      onClick: () => onDelete({ id: physicians.id, name: physicians.name }),
    });
  }

  return (
    <Table.Tr key={physicians.id}>
      {headers.map((header) => (
        <Table.Td key={physicians[header.key] + header.key}>
          {physicians[header.key]}
        </Table.Td>
      ))}
      <Table.Td>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

PhysiciansTableRow.propTypes = physiciansTableRowProps;
