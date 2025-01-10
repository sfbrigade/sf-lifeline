import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { TbSearch as IconSearch } from 'react-icons/tb';
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
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';

import classes from './Users.module.css';
import { UserDataTable } from '../../components/UsersDataTable/UsersDataTable';
import { InviteModal } from './InviteModal';

const headers = [
  { key: 'name', text: 'Name' },
  { key: 'status', text: 'Status' },
  { key: 'role', text: 'Role' },
  { key: 'languages', text: 'Other languages' },
  { key: 'email', text: 'Email address' },
  { key: 'organization', text: 'Organization' },
  { key: 'more', text: '' },
];

/**
 * Users list.
 */
function Users() {
  const navigate = useNavigate();
  const [pendingMembers, setPendingMembers] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);

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
      <InviteModal opened={opened} close={close} />
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
              onClick={() => navigate('/users/pending')}
            >
              Pending Members
            </Button>
            {pendingMembers > 0 ? (
              <Badge className={classes.badge} size="xs" circle color="red">
                {pendingMembers}
              </Badge>
            ) : null}
          </div>
          <Button variant="filled" onClick={open}>
            Invite Member
          </Button>
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
}

export default Users;
