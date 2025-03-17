import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
} from 'react-icons/tb';
import TableMenu from '../../../../../components/DataTable/TableMenu';

const hospitalTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  hospitals: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    // createdBy: PropTypes.string.isRequired,
    // createdAt: PropTypes.string.isRequired,
    // updatedBy: PropTypes.string.isRequired,
    // updatedAt: PropTypes.string.isRequired,
  }),
};

/**
 * Patient table row component
 * @param {PropTypes.InferProps<typeof hospitalTableRowProps>} props
 */
export default function HospitalTableRow ({
  headers,
  hospitals,
}) {
  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/hospital/${hospitals.id}`,
      component: Link,
    }
  ];

  return (
    <Table.Tr key={hospitals.id}>
      {headers.map((header) => (
        <Table.Td key={hospitals[header.key] + header.key}>
          {hospitals[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }}>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

HospitalTableRow.propTypes = hospitalTableRowProps;
