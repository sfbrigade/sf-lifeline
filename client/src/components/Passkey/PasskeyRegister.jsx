import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { notifications } from '@mantine/notifications';
import { useAppContext } from '#app/AppContext';

export default function PasskeyRegister(){
    const { user } = useAppContext();

    const register = async () => {
        const res = await fetch('/api/v1/auth/passkey/options/' + user.id);
        const option = await res.json();
        console.log(option);
        let processPasskey = null;
        try {
            processPasskey = await startRegistration(option);
        } catch (error) {
            if (error.name === 'InvalidStateError') {
                notifications.show({
                    title: 'Error',
                    message: 'Invalid state error',
                    color: 'red',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: 'Error registering passkey',
                    color: 'red',
                });
            }
            throw error;
        }

        const verificationResp = await fetch('/api/v1/auth/passkey/verify-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(processPasskey),
          });
          const verificationJson = await verificationResp.json();
          if (verificationJson.success && verificationJson.verified){
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
    }

    if(!browserSupportsWebAuthn()){
        return <div>Browser does not support WebAuthn</div>;
    }

    return(
        <div>
            <button onClick={register}> Passkey Register</button>
        </div>
    )
}