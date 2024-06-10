import React from 'react';
import PropTypes from 'prop-types';
import { Table } from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

const dataTableProps = {
  striped: PropTypes.bool,
  highlightOnHover: PropTypes.bool,
  withTableBorder: PropTypes.bool,
  withColumnBorders: PropTypes.bool,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ),
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    }),
  ),
};

// TODO: Add sort

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof dataTableProps>} props
 */
export const DataTable = ({ headers = [], rows = [], ...rest }) => {
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
      <TableHeader headers={headers} />
      <Table.Tbody>
        {formattedRows.map((row) => (
          <Table.Tr key={row.id}>
            {row.cells.map((cell) => (
              <Table.Td key={cell.key}>{cell.value}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

DataTable.propTypes = dataTableProps;

const tableHeaderProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    }),
  ),
};

/**
 * DataTable header
 * @param {PropTypes.InferProps<typeof tableHeaderProps>} props
 */
export const TableHeader = ({ headers = [] }) => {
  return (
    <Table.Thead>
      <Table.Tr>
        {headers.map((header) => (
          <Table.Th key={header.key}>
            {header.text}
          </Table.Th>
        ))}
      </Table.Tr>
    </Table.Thead>
  );
};

TableHeader.propTypes = tableHeaderProps;
