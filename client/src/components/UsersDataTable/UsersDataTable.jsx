import PropTypes from 'prop-types';
import DataTable from '../DataTable/DataTable';
import { UserDataTableCell } from './UserDataTableCell';
import { Table } from '@mantine/core';

const userDataTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ),
};

export const UserDataTable = ({ headers = [], rows = [] }) => {
  const renderRow = (row) => (
    <Table.Tr key={row.id}>
      {headers.map((header) => (
        <UserDataTableCell
          key={header.key}
          type={header.key}
          value={row[header.key]}
        />
      ))}
    </Table.Tr>
  );

  return (
    <DataTable
      headers={headers}
      data={rows}
      renderRow={renderRow}
      emptyStateMessage="No users found."
    />
  );
};

UserDataTable.propTypes = userDataTableProps;
