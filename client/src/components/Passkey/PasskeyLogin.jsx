import { startAuthentication } from '@simplewebauthn/browser';
import { Button, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useAppContext } from '#app/AppContext';

export default function PasskeyLogin () {
  const [options, setOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppContext();

  useEffect(() => {
    const getOptions = async () => {
      try {
        const res = await fetch('/api/v1/auth/passkey/authOptions');
        if (!res.ok) {
          return;
        }
        const options = await res.json();
        setOptions(options);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Error getting passkey options',
          color: 'red',
        });
      }
    };
    getOptions();
  }, []);

  const login = async () => {
    if (!options) {
      return;
    }
    setIsLoading(true);
    try {
      const processPasskey = await startAuthentication({ optionsJSON: options });
      processPasskey.challenge = options.challenge;

      const verificationResp = await fetch('/api/v1/auth/passkey/authVerify', {
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

  // Don't show button if options aren't available
  if (!options) {
    return null;
  }

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
