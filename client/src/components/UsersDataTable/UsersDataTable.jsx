import React from 'react';
import PropTypes from 'prop-types';
import { Table } from '@mantine/core';
import { UserDataTableCell } from './UserDataTableCell';

const userDataTableProps = {
  striped: PropTypes.bool,
  highlightOnHover: PropTypes.bool,
  withTableBorder: PropTypes.bool,
  withColumnBorders: PropTypes.bool,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ),
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ),
};

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof userDataTableProps>} props
 */
export const UserDataTable = ({ headers = [], rows = [], ...rest }) => {
  const formattedRows = rows.map((row) => {
    return {
      ...row,
      cells: headers.map((header) => ({
        key: header.key,
        value: row[header.key],
      })),
    };
  });
  return (
    <Table {...rest}>
      <Table.Thead>
        <Table.Tr>
          {headers.map((header) => (
            <Table.Th key={header.key}>{header.text}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {formattedRows.map((row) => (
          <Table.Tr key={row.id}>
            {row.cells.map((cell) => (
              <UserDataTableCell
                key={cell.key}
                type={cell.key}
                value={cell.value}
              />
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

UserDataTable.propTypes = userDataTableProps;
