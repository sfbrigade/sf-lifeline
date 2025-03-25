import PropTypes from 'prop-types';
import { Table } from '@mantine/core';

const patientTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

/**
 * Patient table row component
 * @param {PropTypes.InferProps<typeof hospitalTableRowProps>} props
 */
export default function PatientTableRow ({
  headers,
  patient,
}) {
  return (
    <Table.Tr key={patient.id}>
      {headers.map((header) => (
        <Table.Td key={patient[header.key] + header.key}>
          {patient[header.key]}
        </Table.Td>
      ))}
      <Table.Td style={{ textAlign: 'right' }} />
    </Table.Tr>
  );
}

PatientTableRow.propTypes = patientTableRowProps;
