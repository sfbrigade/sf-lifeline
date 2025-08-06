import PropTypes from 'prop-types';

import { useState, useCallback } from 'react';

import { useAppContext } from '#app/AppContext';
import AllergiesTableRow from './AllergiesTableRow';
import DataTable from '#components/DataTable/DataTable';

const allergiesTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  data: PropTypes.arrayOf(
    PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Allergies table component
 * @param {PropTypes.InferProps<typeof allergiesTableProps>} props
 */
export default function AllergiesTable ({ headers, data }) {
  const { user } = useAppContext();
  const renderRow = useCallback(
    (allergy) => (
      <AllergiesTableRow
        key={allergy.id}
        allergy={allergy}
        headers={headers}
      />
    ),
    [headers, user?.role]
  );

  return (
    <>
      <DataTable
        headers={headers}
        data={data}
        renderRow={renderRow}
        emptyStateMessage='No allergies found.'
      />
    </>
  );
}

AllergiesTable.propTypes = allergiesTableProps;
