import { startAuthentication } from '@simplewebauthn/browser';
import { Button, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useAppContext } from '#app/AppContext';

export default function PasskeyLogin () {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppContext();

  const login = async () => {
    setIsLoading(true);
    try {
      // Fetch authentication options
      const res = await fetch('/api/v1/auth/passkey/login');
      if (!res.ok) {
        notifications.show({
          title: 'Error',
          message: 'Failed to get passkey options',
          color: 'red',
        });
        setIsLoading(false);
        return;
      }
      const options = await res.json();

      const processPasskey = await startAuthentication({ optionsJSON: options });
      processPasskey.challenge = options.challenge;

      const verificationResp = await fetch('/api/v1/auth/passkey/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processPasskey),
        credentials: 'include',
      });

      if (!verificationResp.ok) {
        const errorBody = await verificationResp.json().catch(() => ({}));
        const error = { ...errorBody, status: verificationResp.status };

        notifications.show({
          title: 'Error',
          message: error.message || 'Error logging in with passkey',
          color: 'red',
        });
        return;
      }

      const user = await verificationResp.json();
      if (user && user.id) {
        await setUser(user);
        notifications.show({
          title: 'Success',
          message: 'Passkey logged in successfully',
          color: 'green',
        });
      }
    } catch (error) {
      if (error.name === 'InvalidStateError' || error.name === 'NotAllowedError') {
        notifications.show({
          title: 'Error',
          message: 'Passkey authentication was cancelled or failed',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Error logging in with passkey',
          color: 'red',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Divider label='OR' labelPosition='center' my='md' />
      <Button
        onClick={login}
        variant='outline'
        fullWidth
        disabled={isLoading}
        loading={isLoading}
      >
        Login with Passkey
      </Button>
    </>
  );
}
