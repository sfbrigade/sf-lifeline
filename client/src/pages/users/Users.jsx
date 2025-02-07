import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TbSearch as IconSearch } from 'react-icons/tb';
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Pagination,
  TextInput,
  Text,
} from '@mantine/core';
import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';
import { useUsers } from './useUsers';

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
function Users () {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [inputValue, setInputValue] = useState('');

  const { users, isFetching, page, pages, setPage, setSearch } = useUsers();

  const handleSearch = useDebouncedCallback((query) => {
    setSearch(query);
  }, 500);

  return (
    <Container>
      <InviteModal opened={opened} close={close} />
      <div className={classes.header}>
        <Text fw={600} size='xl' mr='md'>
          Members
        </Text>
        <Group className={classes.actions}>
          <TextInput
            leftSectionPointerEvents='none'
            leftSection={<IconSearch stroke={2} />}
            placeholder='Search'
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              handleSearch(event.currentTarget.value);
            }}
            value={inputValue}
          />
          <div className={classes.relative}>
            <Button
              variant='default'
              onClick={() => navigate('/users/pending')}
            >
              Pending Members
            </Button>
          </div>
          <Button variant='filled' onClick={open}>
            Invite Member
          </Button>
        </Group>
      </div>
      <Divider mb='xl' />
      <Container className={classes.datatableWrapper}>
        <Box pos='relative'>
          <LoadingOverlay
            visible={isFetching}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <UserDataTable
            headers={headers}
            rows={users}
            highlightOnHover
            verticalSpacing='lg'
          />
          <Pagination total={pages} value={page} onChange={setPage} />
        </Box>
      </Container>
    </Container>
  );
}

export default Users;
