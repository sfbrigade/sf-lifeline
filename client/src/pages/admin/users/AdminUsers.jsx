import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDataTable } from '../../../components/UsersDataTable/UsersDataTable';
import { IconSearch } from '@tabler/icons-react';

import classes from './adminUsers.module.css';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  TextInput,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

const headers = [
  { key: 'name', text: 'Name' },
  { key: 'status', text: 'Status' },
  { key: 'role', text: 'Role' },
  { key: 'languages', text: 'Other languages' },
  { key: 'email', text: 'Email address' },
  { key: 'organization', text: 'Organization' },
  { key: 'more', text: '' },
];

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [pendingMembers, setPendingMembers] = useState(0);
  const { isFetching, data } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetch('/api/v1/users', { credentials: 'include' })
        .then((res) => {
          return res.json();
        })
        .then((users) => {
          const pendingUsers = users.filter(
            (user) =>
              user.approvedAt.length == 0 && user.rejectedAt.length == 0,
          );
          setPendingMembers(pendingUsers.length);

          return users.map((user) => {
            return {
              ...user,
              name: user.firstName + ' ' + user.lastName,
              status:
                user.rejectedAt.length > 0
                  ? 'Rejected'
                  : user.approvedAt.length > 0
                    ? 'Active'
                    : 'Pending',
            };
          });
        }),
  });

  return (
    <Container>
      <div className={classes.header}>
        <h4>Members</h4>
        <Group className={classes.actions}>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={<IconSearch stroke={2} />}
            placeholder="Search"
          />
          <div className={classes.relative}>
            <Button
              variant="default"
              onClick={() => navigate('/admin/pending-users')}
            >
              Pending Members
            </Button>
            {pendingMembers > 0 ? (
              <Badge className={classes.badge} size="xs" circle color="red">
                {pendingMembers}
              </Badge>
            ) : null}
          </div>
          <Button variant="filled">Invite Member</Button>
        </Group>
      </div>
      <Divider mb="xl" />
      <Container className={classes.datatableWrapper}>
        <Box pos="relative">
          <LoadingOverlay
            visible={isFetching}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <UserDataTable
            headers={headers}
            rows={data}
            highlightOnHover
            verticalSpacing="lg"
          />
        </Box>
      </Container>
    </Container>
  );
};
