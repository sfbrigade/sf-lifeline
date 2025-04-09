import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const passkeyRoutes = async (fastify) => {
  const rpName = 'SF Lifeline';
  const rpID = process.env.DOMAIN || 'localhost';
  const origin = process.env.NODE_ENV === 'production' 
    ? `https://${rpID}`
    : `http://${rpID}:3000`;
  fastify.post('/register-options', async (request, reply) => {
    try {
      const { email } = request.body;
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true }
      });
      
      if (!user) {
        return reply.code(400).send({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      const userId = isoBase64URL.encode(Buffer.from(user.id, 'utf-8'));
      
      const excludeCredentials = user.passkeys.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: ['internal', 'usb', 'ble', 'nfc', 'hybrid'],
      }));
      
      const options = generateRegistrationOptions({
        rpName,
        rpID,
        userID: userId,
        userName: user.email,
        userDisplayName: `${user.firstName} ${user.lastName}`,
        excludeCredentials,
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform' // 'platform' for mobile devices
        }
      });
      
      request.session.set('challenge', options.challenge);
      
      return reply.send(options);
    } catch (error) {
      console.error('Error generating registration options:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });

  fastify.post('/register-verify', async (request, reply) => {
    try {
      const { email, attestation } = request.body;
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: { passkeys: true }
      });
      
      if (!user) {
        return reply.code(400).send({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      const expectedChallenge = request.session.get('challenge');
      if (!expectedChallenge) {
        return reply.code(400).send({ 
          success: false, 
          message: 'Registration challenge not found' 
        });
      }
      
      const verification = await verifyRegistrationResponse({
        response: attestation,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
      
      if (verification.verified && verification.registrationInfo) {
        await prisma.passkey.create({
          data: {
            userId: user.id,
            credentialID: Buffer.from(verification.registrationInfo.credentialID).toString('base64url'),
            credentialPublicKey: Buffer.from(verification.registrationInfo.credentialPublicKey),
            counter: verification.registrationInfo.counter,
          }
        });
        
        request.session.delete('challenge');
        
        return reply.send({ 
          success: true, 
          message: 'Passkey registered successfully' 
        });
      } else {
        return reply.code(400).send({ 
          success: false, 
          message: 'Passkey registration failed' 
        });
      }
    } catch (error) {
      console.error('Error verifying registration:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });

  fastify.post('/login-options', async (request, reply) => {
    try {
      const { email } = request.body;
      let allowCredentials = [];
      
      if (email) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: { passkeys: true }
        });
        
        if (user && user.passkeys.length > 0) {
          allowCredentials = user.passkeys.map(cred => ({
            id: cred.credentialID,
            type: 'public-key',
            transports: ['internal', 'usb', 'ble', 'nfc', 'hybrid'],
          }));
        }
      }
      
      const options = generateAuthenticationOptions({
        rpID,
        allowCredentials,
        userVerification: 'preferred',
      });
      
      request.session.set('authChallenge', options.challenge);
      
      return reply.send(options);
    } catch (error) {
      console.error('Error generating authentication options:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });

  fastify.post('/login-verify', async (request, reply) => {
    try {
      const { assertion } = request.body;
      
      const expectedChallenge = request.session.get('authChallenge');
      if (!expectedChallenge) {
        return reply.code(400).send({ 
          success: false, 
          message: 'Authentication challenge not found' 
        });
      }
      
      const credentialID = Buffer.from(assertion.id, 'base64url').toString();
      const passkey = await prisma.passkey.findUnique({
        where: { credentialID },
        include: { user: true }
      });
      
      if (!passkey) {
        return reply.code(400).send({ 
          success: false, 
          message: 'Unknown credential' 
        });
      }
      
      const verification = await verifyAuthenticationResponse({
        response: assertion,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(passkey.credentialID, 'base64url'),
          credentialPublicKey: passkey.credentialPublicKey,
          counter: passkey.counter,
        },
      });
      
      if (verification.verified) {
        await prisma.passkey.update({
          where: { id: passkey.id },
          data: { 
            counter: verification.authenticationInfo.newCounter,
            lastUsedAt: new Date()
          }
        });
        
        request.session.delete('authChallenge');
        
        const token = fastify.jwt.sign({ 
          id: passkey.user.id,
          email: passkey.user.email,
          role: passkey.user.role
        });
        
        return reply.send({ 
          success: true, 
          message: 'Authentication successful',
          token,
          user: {
            id: passkey.user.id,
            email: passkey.user.email,
            firstName: passkey.user.firstName,
            lastName: passkey.user.lastName,
            role: passkey.user.role
          }
        });
      } else {
        return reply.code(400).send({ 
          success: false, 
          message: 'Authentication failed' 
        });
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });
};

export default passkeyRoutes; 