import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LifelineAPI from '../patients/LifelineAPI';

const USER_TABLE_HEADERS = [
  { key: 'name', text: 'Name' },
  { key: 'status', text: 'Status' },
  { key: 'role', text: 'Role' },
  { key: 'languages', text: 'Other languages' },
  { key: 'email', text: 'Email address' },
  { key: 'organization', text: 'Organization' },
  { key: 'more', text: '' },
];

export function useUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingMembers, setPendingMembers] = useState(0);
  
  const { data, isFetching } = useQuery({
    queryKey: ['users', search, page],
    queryFn: async () => {
      const res = await LifelineAPI.getUsers(search, page);
      if (!res.ok) {
        throw new Error('Failed to fetch users.');
      }
      const users = await res.json();
      const pages = +res.headers.get('X-Total-Pages');
      
      const pendingUsers = users.filter(
        (user) => user.approvedAt.length === 0 && user.rejectedAt.length === 0
      );
      setPendingMembers(pendingUsers.length);

      const transformedUsers = users.map((user) => ({
        ...user,
        name: user.firstName + ' ' + user.lastName,
        status:
          user.rejectedAt.length > 0
            ? 'Rejected'
            : user.approvedAt.length > 0
              ? 'Active'
              : 'Pending',
      }));

      return { users: transformedUsers, pages };
    },
  });

  console.log(data);

  return {
    users: data?.users,
    headers: USER_TABLE_HEADERS,
    search,
    setSearch,
    page,
    setPage,
    pages: data?.pages,
    isFetching,
    pendingMembers,
  };
}

