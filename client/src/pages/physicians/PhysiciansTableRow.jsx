import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
  TbTrash as IconTrash,
} from 'react-icons/tb';
import TableMenu from '#components/DataTable/TableMenu';

const physiciansTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  physician: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    phone: PropTypes.string,
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
  physician,
  onDelete,
  showDeleteMenu,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/physicians/${physician.id}`,
      component: Link,
    }
  ];

  if (showDeleteMenu) {
    menuItems.push({
      icon: <IconTrash size={18} />,
      label: 'Delete',
      color: 'red',
      onClick: () => onDelete({ id: physician.id, name: physician.name }),
    });
  }

  return (
    <Table.Tr className='clickable' key={physician.id}>
      {headers.map((header) => (
        <Table.Td onClick={() => navigate(`/physicians/${physician.id}`)} key={physician[header.key] + header.key}>
          {physician[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }}>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

PhysiciansTableRow.propTypes = physiciansTableRowProps;
