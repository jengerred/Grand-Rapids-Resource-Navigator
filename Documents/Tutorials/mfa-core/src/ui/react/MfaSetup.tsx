'use client'

import { useState, useEffect } from 'react';
import { MFACore } from '../../core/totp';

export const MfaSetup = ({ email, issuer, onVerified }: {
  email: string;
  issuer: string;
  onVerified: (secret: string) => void;
}) => {
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const { base32, otpauth_url } = MFACore.generateSecret(email, issuer);
    setSecret(base32);
    MFACore.generateQRCode(otpauth_url).then(setQrCode);
  }, [email, issuer]);

  const verify = () => {
    if (MFACore.verifyCode(secret, code)) {
      onVerified(secret);
    }
  };

  return (
    <div className="mfa-setup">
      <img src={qrCode} alt="MFA QR Code" />
      <input 
        type="text" 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter 6-digit code"
      />
      <button onClick={verify}>Verify</button>
    </div>
  );
};
