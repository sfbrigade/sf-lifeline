import React from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Home page component.
 */
function Index() {
  const { isFetching, error } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetch('/api/v1/users/list', { credentials: 'include' }).then((res) => {
        return res.json();
      }),
  });

  if (isFetching) {
    return <main>Index is loading</main>;
  }

  if (error) {
    return <main>Index fetch failed</main>;
  }

  return <main>Index is working</main>;
}

export default Index;
