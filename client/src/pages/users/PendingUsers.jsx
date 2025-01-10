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
import { TbChevronLeft as IconChevronLeft } from 'react-icons/tb';
import { useNavigate } from 'react-router';

import classes from './PendingUsers.module.css';
import { UserDataTable } from '../../components/UsersDataTable/UsersDataTable';

/**
 * Page for admin to view pending users
 */
function PendingUsers() {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isFetching,
    data = [],
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetch('/api/v1/users?status=unapproved', { credentials: 'include' }).then(
        (res) => {
          return res.json();
        },
      ),
  });

  const transformedData = data.map((user) => ({
    ...user,
    name: `${user.firstName} ${user.lastName}`,
    status: 'Pending',
    checkbox: {
      selected: selectedUsers.includes(user),
      select: (e) => {
        setSelectedUsers((prevSelectedRows) => {
          return e.target.checked
            ? [...prevSelectedRows, user]
            : prevSelectedRows.filter((other) => other.email !== user.email);
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
              setSelectedUsers(data);
            } else {
              setSelectedUsers([]);
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

  /**
   * Approve or rejects selected pending users
   * @param {string} status string that either holds "approve" or "reject"
   */
  async function updateStatus(status) {
    setIsLoading(true);

    const fetchPromises = selectedUsers.map((user) =>
      fetch(`/api/v1/users/${user.id}/${status}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(user),
      }),
    );
    try {
      // Wait for all fetch requests to complete
      await Promise.all(fetchPromises);
    } catch (err) {
      // Handle errors from any of the fetch requests
      console.error(err);
    } finally {
      // Reset loading state
      refetch();
      setIsLoading(false);
    }
  }
  return (
    <Container fluid mt={20}>
      <IconChevronLeft
        stroke={1}
        size={32}
        onClick={() => navigate(-1)}
        cursor={'pointer'}
      />
      <Container className={classes.datatableWrapper}>
        <LoadingOverlay
          visible={isFetching || isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Box>
          <Container className={classes.header}>
            <h4>Pending Members</h4>
            <Group>
              <Button
                variant="default"
                onClick={() => {
                  updateStatus('reject');
                }}
              >
                Deny
              </Button>
              <Button
                variant="filled"
                onClick={() => {
                  updateStatus('approve');
                }}
              >
                Approve
              </Button>
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

export default PendingUsers;
