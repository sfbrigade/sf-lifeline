import PropTypes from 'prop-types';

import { useCallback } from 'react';
import HospitalTableRow from './HospitalTableRow';
import DataTable from '#components/DataTable/DataTable.jsx';

const hospitalTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  hospitals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Patients table component
 * @param {PropTypes.InferProps<typeof hospitalTableProps>} props
 */
export default function HospitalTable ({ headers, hospitals }) {
  const renderRow = useCallback(
    (hospitals) => (
      <HospitalTableRow
        key={hospitals.id}
        hospital={hospitals}
        headers={headers}
      />
    ),
    [headers]
  );

  return (
    <>
      <DataTable
        headers={headers}
        data={hospitals}
        renderRow={renderRow}
        emptyStateMessage='No Hospitals found.'
      />
    </>
  );
}

HospitalTable.propTypes = hospitalTableProps;
