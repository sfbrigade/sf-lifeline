import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Table, Text } from '@mantine/core';
import { DataTableMenu } from './DataTableMenu';

const userDataTableProps = {
  type: PropTypes.string.isRequired,
  value: PropTypes.node,
};

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof userDataTableProps>} props
 */
export const UserDataTableCell = ({ type, value }) => {
  switch (type) {
    case 'status':
      return (
        <Table.Td>
          <Badge color={value === 'Active' ? 'green' : 'red'}>{value}</Badge>
        </Table.Td>
      );
    case 'role':
      return (
        <Table.Td>
          <Badge color={value === 'ADMIN' ? 'purple' : 'blue'}>
            <Text fw={700} tt="capitalize" size="sm">
              {value.toLocaleLowerCase().replace('_', ' ')}
            </Text>
          </Badge>
        </Table.Td>
      );
    case 'more':
      return (
        <Table.Td>
          <DataTableMenu />
        </Table.Td>
      );
    default:
      return <Table.Td>{value}</Table.Td>;
  }
};

UserDataTableCell.propTypes = userDataTableProps;
