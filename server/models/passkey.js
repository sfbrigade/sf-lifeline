import { Prisma } from '@prisma/client';
import { z } from 'zod';
import Base from './base.js';

// WebAuthn Registration Options Response Schema
export const RegistrationOptionsResponseSchema = z.object({
  challenge: z.string(),
  rp: z.object({
    name: z.string(),
    id: z.string(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  pubKeyCredParams: z.array(z.any()),
  timeout: z.number(),
  attestation: z.string(),
  excludeCredentials: z.array(z.any()).optional(),
  authenticatorSelection: z.object({
    residentKey: z.string(),
    userVerification: z.string(),
  }),
});

// WebAuthn Registration Verification Request Schema
export const RegistrationVerificationRequestSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    attestationObject: z.string(),
    clientDataJSON: z.string(),
    transports: z.array(z.string()).optional(),
    publicKeyAlgorithm: z.number().optional(),
    publicKey: z.string().optional(),
    authenticatorData: z.string().optional(),
  }),
  type: z.string(),
  clientExtensionResults: z.object({}).optional(),
  authenticatorAttachment: z.string().optional(),
});

// WebAuthn Registration Verification Response Schema
export const RegistrationVerificationResponseSchema = z.object({
  success: z.boolean(),
  verified: z.boolean(),
});

// WebAuthn Authentication Options Response Schema
export const AuthenticationOptionsResponseSchema = z.object({
  challenge: z.string(),
  rp: z.object({
    name: z.string(),
    id: z.string(),
  }).optional(),
  rpId: z.string().optional(),
  allowCredentials: z.array(z.any()).optional(),
  timeout: z.number().optional(),
  userVerification: z.string().optional(),
  extensions: z.record(z.any()).optional(),
});

// WebAuthn Authentication Verification Request Schema
export const AuthenticationVerificationRequestSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    authenticatorData: z.string(),
    clientDataJSON: z.string(),
    signature: z.string(),
    userHandle: z.string().nullable().optional(),
  }),
  type: z.string(),
  clientExtensionResults: z.record(z.any()).optional(),
  authenticatorAttachment: z.string().optional(),
  challenge: z.string(),
});

// Legacy passkey schemas (for backward compatibility)
const PasskeyAttributesSchema = z.object({
  id: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  attestationData: z.string(),
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  userId: z.string().uuid(),
  transports: z.string().nullable().optional(),
});

const PasskeyResponseSchema = z.object({
  id: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  attestationData: z.string(),
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  userId: z.string().uuid(),
  transports: z.string().nullable().optional(),
});

class Passkey extends Base {
  static AttributesSchema = PasskeyAttributesSchema;
  static ResponseSchema = PasskeyResponseSchema;

  // WebAuthn schemas
  static RegistrationOptionsResponseSchema = RegistrationOptionsResponseSchema;
  static RegistrationVerificationRequestSchema = RegistrationVerificationRequestSchema;
  static RegistrationVerificationResponseSchema = RegistrationVerificationResponseSchema;
  static AuthenticationOptionsResponseSchema = AuthenticationOptionsResponseSchema;
  static AuthenticationVerificationRequestSchema = AuthenticationVerificationRequestSchema;

  constructor (data) {
    super(Prisma.PasskeyScalarFieldEnum, data);
  }

  getTransports () {
    return this.transports;
  }

  getCredentialId () {
    return this.credentialId;
  }

  getPublicKey () {
    return this.publicKey;
  }

  getAttestationData () {
    return this.attestationData;
  }

  getClientDataJSON () {
    return this.clientDataJSON;
  }

  getAuthenticatorData () {
    return this.authenticatorData;
  }

  getUserId () {
    return this.userId;
  }
}

export { Passkey };

export default Passkey;
