import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';

export default function PasskeyLogin(){

    const login = async () => {
        const res = await fetch("/api/v1/passkey/options");
        const optionsJson = await res.json();
        let processPasskey = null;
        try {
            processPasskey = await startAuthentication({optionsJson});
        } catch (error) {
            if (error.name === 'InvalidStateError') {
                notifications.show({
                    title: 'Error',
                    message: 'Invalid state error',
                    color: 'red',
                });
            } else {
                throw error;
            }
        }

        const verificationResp = await fetch('/api/v1/passkey/verifyAuthentication', {
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
                message: 'Passkey logged in successfully',
                color: 'green',
            });
          }
          else {
            notifications.show({
                title: 'Error',
                message: 'Error logging in with passkey',
                color: 'red',
            });
          }     
    }
    if(!browserSupportsWebAuthn()){
        return <div>Browser does not support WebAuthn</div>;
    }

    return(
    <>
        <button onClick={login}> Passkey Login</button>
    </>
    )
}