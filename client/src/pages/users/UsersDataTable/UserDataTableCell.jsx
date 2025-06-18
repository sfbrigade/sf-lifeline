import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import { rem, Badge, Checkbox, Table, Text } from '@mantine/core';
import { humanize } from 'inflection';
import {
  TbUser as IconUser,
} from 'react-icons/tb';

import TableMenu from '#components/DataTable/TableMenu';

const userDataTableProps = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.any,
};

/**
 * Basic DataTable
 * @param {PropTypes.InferProps<typeof userDataTableProps>} props
 */
export const UserDataTableCell = ({ id, type, value }) => {
  const navigate = useNavigate();

  const statusColor = (() => {
    if (value === 'Disabled' || value === 'Rejected') {
      return 'red';
    } else if (value === 'Active') {
      return 'green';
    } else {
      return 'yellow';
    }
  })();
  switch (type) {
    case 'status': {
      return (
        <Table.Td onClick={() => navigate(`/users/${id}`)}>
          <Badge color={statusColor}>
            <Text span visibleFrom='sm' fw={700} tt='capitalize' size='sm'>
              {value}
            </Text>
            <Text span hiddenFrom='sm' fw={700} tt='capitalize' size='sm'>
              {value[0]}
            </Text>
          </Badge>
        </Table.Td>
      );
    }
    case 'role':
      return (
        <Table.Td onClick={() => navigate(`/users/${id}`)}>
          <UserRoleBadge value={value ?? ''} />
        </Table.Td>
      );
    case 'more':
      return (
        <Table.Td>
          <TableMenu menuItems={[
            {
              icon: <IconUser style={{ width: rem(14), height: rem(14) }} />,
              label: 'View/Edit',
              onClick: () => navigate(`/users/${id}`)
            },
          ]}
          />
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
      return <Table.Td onClick={() => navigate(`/users/${id}`)}>{value}</Table.Td>;
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
    <Badge
      color={color}
      style={{ padding: '0.25rem 0.5rem' }}
    >
      <Text span visibleFrom='sm' fw={700} tt='capitalize' size='sm'>
        {humanize(value)}
      </Text>
      <Text span hiddenFrom='sm' fw={700} tt='capitalize' size='sm'>
        {value[0]}
      </Text>
    </Badge>
  );
};

UserRoleBadge.propTypes = userRoleBadgeProps;
