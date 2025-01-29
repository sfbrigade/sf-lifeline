import PropTypes from 'prop-types';
import { Paper, Table } from '@mantine/core';
import classes from './DataTable.module.css';

const dataTableProps = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.node,
    })
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ),
  renderRow: PropTypes.func.isRequired,
  emptyStateMessage: PropTypes.string,
};

/**
 * Reusable DataTable component
 * @param {PropTypes.InferProps<typeof dataTableProps>} props
 */
export default function DataTable({
  headers,
  data = [],
  renderRow,
  emptyStateMessage = 'No data found.',
}) {
  const emptyStateRow = (
    <Table.Tr>
      <Table.Td colSpan={headers.length}>{emptyStateMessage}</Table.Td>
    </Table.Tr>
  );

  return (
    <Paper withBorder className={classes.tableWrapper}>
      <Table.ScrollContainer minWidth={500} type="native">
        <Table
          stickyHeader
          highlightOnHover
          verticalSpacing="lg"
          classNames={{ table: classes.table }}
        >
          <Table.Thead>
            <Table.Tr>
              {headers.map((header) => (
                <Table.Th key={header.key}>{header.text}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.length > 0 ? data.map(renderRow) : emptyStateRow}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

DataTable.propTypes = dataTableProps;
