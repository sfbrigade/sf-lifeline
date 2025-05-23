import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TbSearch as IconSearch } from 'react-icons/tb';
import {
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Pagination,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';
import { useUsers } from './useUsers';
import classes from './Users.module.css';
import { UserDataTable } from './UsersDataTable/UsersDataTable';
import { InviteModal } from './InviteModal';

const headers = [
  { key: 'name', text: 'Name' },
  { key: 'status', text: 'Status' },
  { key: 'role', text: 'Role' },
  { key: 'email', text: 'Email address' },
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
      <Group justify='space-between' wrap='nowrap' my='sm' style={{ flexWrap: 'wrap' }}>
        <Title order={2} mr='md' className={classes.MembersTitle} >
          Members
        </Title>
        <Group justify = "center">
          <TextInput
            leftSectionPointerEvents='none'
            leftSection={<IconSearch />}
            placeholder='Search'
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              handleSearch(event.currentTarget.value);
            }}
            value={inputValue}
          />
          <Button
            variant='default'
            onClick={() => navigate('/users/pending')}
          >
            Pending Members
          </Button>
          <Button variant='filled' onClick={open}>
            Invite Member
          </Button>
        </Group>
      </Group>
      <Divider mb='xl' />
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
    </Container>
  );
}

export default Users;
