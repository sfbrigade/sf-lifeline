import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Context from '../Context';

/*globals user*/

/**
 *
 * @returns {{
 *  user: user,
 *  isLoading: boolean,
 *  handleLogin: (credentials: any) => Promise<void>,
 *  handleLogout: () => Promise<void>,
 * }}
 */
export function useAuthorization() {
  const { user, setUser } = useContext(Context);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials) => {
      return fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
    },
    onSuccess: async (data, { redirectTo }) => {
      const result = await data.json();
      setUser(result);
      navigate(redirectTo ?? '/');
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
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    handleLogin,
    handleLogout,
  };
}
