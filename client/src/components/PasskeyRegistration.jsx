import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { isWebAuthnSupported } from '../utils/webAuthn';

const PasskeyRegistration = ({ email, onSuccess }) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const registerPasskey = async () => {
    try {
      setLoading(true);
      setStatus('Starting passkey registration...');
      
      // 1. Get registration options from server
      const optionsResponse = await post('/api/v1/auth/passkey/register-options', { email });
      const options = optionsResponse.data;
      
      // 2. Create credential using browser's WebAuthn API
      setStatus('Please follow the prompts on your device...');
      const attestation = await startRegistration(options);
      
      // 3. Send attestation to server for verification
      const verificationResponse = await post('/api/v1/auth/passkey/register-verify', {
        email,
        attestation
      });
      
      if (verificationResponse.data.success) {
        setStatus('Passkey registered successfully!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setStatus(`Registration failed: ${verificationResponse.data.message}`);
      }
    } catch (error) {
      console.error('Passkey registration error:', error);
      setStatus(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isWebAuthnSupported()) {
    return null; // Don't show the component if WebAuthn is not supported
  }

  return (
    <div className="passkey-registration">
      <h3>Add a Passkey</h3>
      <p>
        Passkeys are a more secure and convenient way to sign in without passwords.
        They use your device's biometrics (like Face ID or fingerprint).
      </p>
      <button 
        onClick={registerPasskey} 
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Processing...' : 'Register Passkey'}
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
};

export default PasskeyRegistration; 