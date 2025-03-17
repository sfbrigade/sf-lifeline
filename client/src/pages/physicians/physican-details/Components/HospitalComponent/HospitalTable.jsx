import PropTypes from 'prop-types';

import { useCallback } from 'react';

import HospitalTableRow from './HospitalTableRow';
import DataTable from '../../../../../components/DataTable/DataTable';

const hostpitalTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  hospitals: PropTypes.arrayOf(
    PropTypes.shape({
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
        hospitals={hospitals}
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

HospitalTable.propTypes = hostpitalTableProps;
