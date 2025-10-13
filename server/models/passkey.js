import { Prisma } from '@prisma/client';
import { z } from 'zod';
import Base from './base.js';

const PasskeyAttributesSchema = z.object({
  id: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  attestationData: z.string(),
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  userId: z.string().uuid(),
  transports: z.string().nullable().optional()
});


const PasskeyResponseSchema = {
  id: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  attestationData: z.string(),
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  userId: z.string().uuid(),
  transports: z.string().nullable().optional()
};


class Passkey extends Base {
    
  static PasskeyScheme = PasskeyAttributesSchema;
  static ResponseSchema = PasskeyResponseSchema;


  constructor (data) {
    super(Prisma.UserScalarFieldEnum, data);
  }
  
  getTransports() {
    return this.transports;
  }

  getCredentialId() {
    return this.credentialId;
  }
  
  getPublicKey() {
    return this.publicKey;
  }
  
  getAttestationData() {
    return this.attestationData;
  }
  
  getClientDataJSON() {
    return this.clientDataJSON;
  }
  
  getAuthenticatorData() {
    return this.authenticatorData;
  }
  
  getUserId() {
    return this.userId;
  }
  
}

export { Passkey };

export default Passkey;
