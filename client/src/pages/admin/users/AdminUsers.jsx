import React from 'react';
import { DataTable } from '../../../components/DataTable/DataTable';
import { IconSearch } from '@tabler/icons-react';

import classes from './adminUsers.module.css';
import { Badge, Button, Group, TextInput } from '@mantine/core';

const mockUsersList = [
  {
    id: '1',
    name: 'tester',
    status: 'tester',
    role: 'tester',
    languages: 'tester',
    email: 'tester',
    organization: 'tester',
    more: '...',
  },
  {
    id: '2',
    name: 'tester2',
    status: 'tester2',
    role: 'tester2',
    languages: 'tester2',
    email: 'tester2',
    organization: 'tester2',
    more: '...',
  },
];

const headers = [
  { key: 'name', text: 'Name' },
  { key: 'status', text: 'Status' },
  { key: 'role', text: 'Role' },
  { key: 'languages', text: 'Other languages' },
  { key: 'email', text: 'Email address' },
  { key: 'organization', text: 'Organization' },
  { key: 'more', text: '' },
];

const pendingMembers = 4;

// TODO: Add in search/filter for the table
// TODO: Add custom render for cells
// TODO: Add location highlighting in side navigation component

export const AdminUsers = () => {
  return (
    <>
      <div className={classes.header}>
        <h4>Members</h4>
        <Group className={classes.actions}>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={<IconSearch stroke={2} />}
            placeholder="Search"
          />
          <div className={classes.relative}>
            <Button variant="default">Pending Members</Button>
            {pendingMembers > 0 ? (
              <Badge className={classes.badge} size="xs" circle color='red'>
                {pendingMembers}
              </Badge>
            ): null}
          </div>
          <Button variant="filled">Invite Member</Button>
        </Group>
      </div>
      <div className={classes.datatableWrapper}>
        <DataTable
          headers={headers}
          rows={mockUsersList}
          highlightOnHover
          verticalSpacing="lg"
        />
      </div>
    </>
  );
};
