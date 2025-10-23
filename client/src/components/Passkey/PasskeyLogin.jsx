import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useAppContext } from '#app/AppContext';

export default function PasskeyLogin () {
  const [options, setOptions] = useState(null);
  const { setUser } = useAppContext();
  useEffect(() => {
    const getOptions = async () => {
      const res = await fetch('/api/v1/auth/passkey/authOptions');
      const options = await res.json();
      setOptions(options);
    };
    getOptions();
  }, []);

  const login = async () => {
    const processPasskey = await startAuthentication({ optionsJSON: options });
    processPasskey.challenge = options.challenge;
    const verificationResp = await fetch('/api/v1/auth/passkey/authVerify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processPasskey),
    });
    const user = await verificationResp.json();
    if (user) {
      notifications.show({
        title: 'Success',
        message: 'Passkey logged in successfully',
        color: 'green',
      });
      await setUser(user);
    } else {
      notifications.show({
        title: 'Error',
        message: 'Error logging in with passkey',
        color: 'red',
      });
    }
  };

  return (
    <Button onClick={login}>Login with Passkey</Button>
  );
}
