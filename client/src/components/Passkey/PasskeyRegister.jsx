import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { notifications } from '@mantine/notifications';
import { useAppContext } from '#app/AppContext';

export default function PasskeyRegister () {
  const { user } = useAppContext();

  const register = async () => {
    const res = await fetch('/api/v1/auth/passkey/options?id=' + user.id);
    const option = await res.json();
    let processPasskey = null;
    try {
      processPasskey = await startRegistration({ optionsJSON: option });
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        notifications.show({
          title: 'Error',
          message: 'Passkey registration was cancelled or failed',
          color: 'red',
        });
      } else if (error.name === 'InvalidStateError') {
        notifications.show({
          title: 'Error',
          message: 'Passkey already registered',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Error registering passkey. Please try again.',
          color: 'red',
        });
      }
      return;
    }

    const verificationResp = await fetch('/api/v1/auth/passkey/verify-registration/' + user.id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...processPasskey,
      }),
    });
    const verificationJson = await verificationResp.json();

    if (verificationJson.success && verificationJson.verified) {
      notifications.show({
        title: 'Success',
        message: 'Passkey registered successfully',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Error',
        message: 'Error registering passkey',
        color: 'red',
      });
    }
  };

  if (!browserSupportsWebAuthn()) {
    return <div>Browser does not support WebAuthn</div>;
  }

  return (
    <div>
      <button onClick={register}> Passkey Register</button>
    </div>
  );
}
