import PropTypes from 'prop-types';
import { Table } from '@mantine/core';

const hospitalTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  hospital: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

/**
 * Patient table row component
 * @param {PropTypes.InferProps<typeof hospitalTableRowProps>} props
 */
export default function HospitalTableRow ({
  headers,
  hospital,
}) {
  return (
    <Table.Tr key={hospital.id}>
      {headers.map((header) => (
        <Table.Td key={hospital[header.key] + header.key}>
          {hospital[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }} />
    </Table.Tr>
  );
}

HospitalTableRow.propTypes = hospitalTableRowProps;
