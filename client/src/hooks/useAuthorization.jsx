import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useAppContext } from '#app/AppContext';

/**
 * Global user and login/logout logic
 *
 * @returns {{
 *  user: user,
 *  error: object,
 *  isLoading: boolean,
 *  handleLogin: (credentials: any) => Promise<void>,
 *  handleLogout: () => Promise<void>,
 * }}
 */
export function useAuthorization () {
  const { user, setUser } = useAppContext();
  const [error, setError] = useState(null);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      return await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response;
      });
    },
    onSuccess: async (data) => {
      const result = await data.json();
      setUser(result);
    },
    onError: async (error) => {
      const errorBody = await error.json();
      setError({ ...errorBody, status: error.status });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      return fetch('/api/v1/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
    },
  });

  const handleLogin = (credentials) => loginMutation.mutateAsync(credentials);

  const handleLogout = () => logoutMutation.mutateAsync();

  return {
    user,
    error,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    handleLogin,
    handleLogout,
  };
}
