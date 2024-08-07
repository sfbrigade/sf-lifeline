import {
  Container,
  Box,
  LoadingOverlay,
  Checkbox,
  Group,
  Button,
} from '@mantine/core';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconChevronLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import classes from './adminPendingUsers.module.css';
import { UserDataTable } from '../../../components/UsersDataTable/UsersDataTable';

/**
 * Page for admin to view pending users
 */
function AdminPendingUsers() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const { isFetching, data = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetch('/api/v1/users', { credentials: 'include' }).then((res) => {
        return res.json();
      }),
  });

  const transformedData = data.map((user) => ({
    ...user,
    name: `${user.firstName} ${user.lastName}`,
    checkbox: {
      selected: selectedRows.includes(user.email),
      select: (e) => {
        setSelectedRows((prevSelectedRows) => {
          return e.target.checked
            ? [...prevSelectedRows, user.email]
            : prevSelectedRows.filter((email) => email !== user.email);
        });
      },
    },
  }));

  const headers = [
    {
      key: 'checkbox',
      text: (
        <Checkbox
          aria-label="Select row"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(data.map((user) => user.email));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
    },
    { key: 'name', text: 'Name' },
    { key: 'status', text: 'Status' },
    { key: 'role', text: 'Role' },
    { key: 'languages', text: 'Other languages' },
    { key: 'email', text: 'Email address' },
    { key: 'organization', text: 'Organization' },
    { key: 'more', text: '' },
  ];
  return (
    <Container fluid={true} mt={20}>
      <IconChevronLeft
        stroke={1}
        size={32}
        onClick={() => navigate(-1)}
        cursor={'pointer'}
      />
      <Container className={classes.datatableWrapper}>
        <LoadingOverlay
          visible={isFetching}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Box>
          <Container className={classes.header}>
            <h4>Pending Members</h4>
            <Group>
              <Button variant="default">Deny</Button>
              <Button variant="filled">Approve</Button>
            </Group>
          </Container>

          <UserDataTable
            headers={headers}
            rows={transformedData}
            highlightOnHover
            verticalSpacing="lg"
          />
        </Box>
      </Container>
    </Container>
  );
}

export default AdminPendingUsers;
