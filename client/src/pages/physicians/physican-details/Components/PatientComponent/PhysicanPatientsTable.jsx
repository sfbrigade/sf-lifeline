import PropTypes from 'prop-types';

import { useCallback } from 'react';
import DataTable from '#components/DataTable/DataTable.jsx';
import PhysicanPatientsTableRow from './PhysicanPatientsTableRow.jsx';

const physicanPatientTable = {
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
 * @param {PropTypes.InferProps<typeof physicanPatientTable>} props
 */
export default function PhysicanPatientTable ({ headers, patients }) {
  const renderRow = useCallback(
    (patients) => (
      <PhysicanPatientsTableRow
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

PhysicanPatientTable.propTypes = physicanPatientTable;
