import PropTypes from 'prop-types';

import { useCallback } from 'react';
import DataTable from '../../../../../components/DataTable/DataTable.jsx';
import PatientTableRow from './PatientTableRow';

const patientTableRowProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Patients table component
 * @param {PropTypes.InferProps<typeof patientTableRow>} props
 */
export default function PatientTable ({ headers, patients }) {
  const renderRow = useCallback(
    (patients) => (
      <PatientTableRow
        key={patients.id}
        patient={patients}
        headers={headers}
      />
    ),
    [headers]
  );

  return (
    <>
      <DataTable
        headers={headers}
        data={patients}
        renderRow={renderRow}
        emptyStateMessage='No Patients found.'
      />
    </>
  );
}

PatientTable.propTypes = patientTableRowProps;
