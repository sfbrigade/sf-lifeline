import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Context from '../Context';

/*globals user*/

/**
 *
 * @returns {{
 *  user: user,
 *  error: object,
 *  isLoading: boolean,
 *  handleLogin: (credentials: any) => Promise<void>,
 *  handleLogout: () => Promise<void>,
 * }}
 */
export function useAuthorization() {
  const { user, setUser } = useContext(Context);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    onSuccess: async (data, { redirectTo }) => {
      const result = await data.json();
      setUser(result);
      navigate(redirectTo ?? '/');
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
      navigate('/');
    },
  });

  const handleLogin = async (credentials) => {
    loginMutation.mutate(credentials);
  };

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  return {
    user,
    error,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    handleLogin,
    handleLogout,
  };
}
