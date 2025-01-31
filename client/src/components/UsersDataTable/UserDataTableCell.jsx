import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Checkbox, Table, Text } from '@mantine/core';
import { humanize } from 'inflection';
import { DataTableMenu } from './DataTableMenu';

const userDataTableProps = {
  type: PropTypes.string.isRequired,
  value: PropTypes.any,
};

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof userDataTableProps>} props
 */
export const UserDataTableCell = ({ type, value }) => {
  switch (type) {
    case 'status': {
      const color =
        value === 'Disabled' || value === 'Rejected'
          ? 'red'
          : value === 'Active'
            ? 'green'
            : 'yellow';
      return (
        <Table.Td>
          <Badge color={color}>
            <Text span visibleFrom="sm" fw={700} tt="capitalize" size="sm">
              {value}
            </Text>
            <Text span hiddenFrom="sm" fw={700} tt="capitalize" size="sm">
              {value[0]}
            </Text>
          </Badge>
        </Table.Td>
      );
    }
    case 'role':
      return (
        <Table.Td>
          <UserRoleBadge value={value ?? ''} />
        </Table.Td>
      );
    case 'more':
      return (
        <Table.Td>
          <DataTableMenu />
        </Table.Td>
      );
    case 'checkbox':
      return (
        <Table.Td>
          <Checkbox
            checked={value.selected}
            // onChange is a Mantine prop for the Checkbox component, neostandard improperly considers it a react event handler
            // eslint-disable-next-line react/jsx-handler-names
            onChange={value.select}
          />
        </Table.Td>
      );
    default:
      return <Table.Td>{value}</Table.Td>;
  }
};

UserDataTableCell.propTypes = userDataTableProps;

const userRoleBadgeProps = {
  value: PropTypes.string.isRequired,
};

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof userRoleBadgeProps>} props
 */
const UserRoleBadge = ({ value }) => {
  let color = 'purple';
  switch (value) {
    case 'ADMIN':
      color = 'purple';
      break;
    case 'STAFF':
      color = 'green';
      break;
    case 'FIRST_RESPONDER':
      color = 'blue';
      break;
    case 'VOLUNTEER':
    default:
      color = 'orange';
      break;
  }
  return (
    <Badge color={color} style={{ whiteSpace: 'nowrap', padding: '0.25rem 0.5rem' }}>
      <Text
        span
        visibleFrom="sm"
        fw={700}
        tt="capitalize"
        size="sm"
        style={{
          lineHeight: '1.2',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        {humanize(value)}
      </Text>
      <Text
        span
        hiddenFrom="sm"
        fw={700}
        tt="capitalize"
        size="sm"
        style={{
          lineHeight: '1.2',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2px'
        }}
      >
        {value[0]}
      </Text>
    </Badge>
  );
};

UserRoleBadge.propTypes = userRoleBadgeProps;
