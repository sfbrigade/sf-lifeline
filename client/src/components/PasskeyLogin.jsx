import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { isWebAuthnSupported } from '../utils/webAuthn';

const PasskeyLogin = ({ email, onSuccess }) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasskeyLogin = async () => {
    try {
      setLoading(true);
      setStatus('Starting passkey authentication...');
      
      // 1. Get authentication options from server
      const optionsResponse = await post('/api/v1/auth/passkey/login-options', { email });
      const options = optionsResponse.data;
      
      // 2. Get credential using browser's WebAuthn API
      setStatus('Please follow the prompts on your device...');
      const assertion = await startAuthentication(options);
      
      // 3. Send assertion to server for verification
      const verificationResponse = await post('/api/v1/auth/passkey/login-verify', {
        assertion
      });
      
      if (verificationResponse.data.success) {
        setStatus('Authentication successful!');
        if (onSuccess) {
          onSuccess(verificationResponse.data.token, verificationResponse.data.user);
        }
      } else {
        setStatus(`Authentication failed: ${verificationResponse.data.message}`);
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      setStatus(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isWebAuthnSupported()) {
    return null; // Don't show the component if WebAuthn is not supported
  }

  return (
    <div className="passkey-login">
      <button 
        onClick={handlePasskeyLogin} 
        disabled={loading}
        className="btn btn-secondary btn-block"
      >
        {loading ? 'Processing...' : 'Sign in with Passkey'}
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
};

export default PasskeyLogin; 