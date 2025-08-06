import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router';
import { Table } from '@mantine/core';
import {
  TbUser as IconUser,
} from 'react-icons/tb';
import TableMenu from '#components/DataTable/TableMenu';

const allergiesTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  allergy: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }),
};

/**
 * Allergies table row component
 * @param {PropTypes.InferProps<typeof allergiesTableRowProps>} props
 */
export default function AllergiesTableRow ({
  headers,
  allergy,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <IconUser size={18} />,
      label: 'View/Edit',
      to: `/allergies/${allergy.id}`,
      component: Link,
    }
  ];

  return (
    <Table.Tr className='clickable' key={allergy.id}>
      {headers.map((header) => (
        <Table.Td onClick={() => navigate(`/allergies/${allergy.id}`)} key={allergy[header.key] + header.key}>
          {allergy[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }}>
        <TableMenu menuItems={menuItems} />
      </Table.Td>
    </Table.Tr>
  );
}

AllergiesTableRow.propTypes = allergiesTableRowProps;
