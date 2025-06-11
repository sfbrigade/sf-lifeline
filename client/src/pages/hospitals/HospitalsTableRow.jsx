import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
  TbTrash as IconTrash,
} from 'react-icons/tb';
import TableMenu from '../../components/DataTable/TableMenu';

const hospitalsTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  Hospitals: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }),

  onDelete: PropTypes.func.isRequired,
  showDeleteMenu: PropTypes.bool.isRequired,
};

/**
 * Hospitals table row component
 * @param {PropTypes.InferProps<typeof hospitalsTableRowProps>} props
 */
export default function HospitalsTableRow ({
  headers,
  hospitals,
  onDelete,
  showDeleteMenu,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/hospitals/${hospitals.id}`,
      component: Link,
    }
  ];

  if (showDeleteMenu) {
    menuItems.push({
      icon: <IconTrash size={18} />,
      label: 'Delete',
      color: 'red',
      onClick: () => onDelete({ id: hospitals.id, name: hospitals.name }),
    });
  }

  return (
    <Table.Tr className='clickable' key={hospitals.id}>
      {headers.map((header) => (
        <Table.Td onClick={() => navigate(`/hospitals/${hospitals.id}`)} key={hospitals[header.key] + header.key}>
          {hospitals[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }}>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

HospitalsTableRow.propTypes = hospitalsTableRowProps;
