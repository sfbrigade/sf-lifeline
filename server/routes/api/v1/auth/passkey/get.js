import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse
  } from '@simplewebauthn/server';

import Passkey from '#models/passkey.js';

// Store registration options temporarily (in production, use Redis or database)
const registrationOptions = new Map();

export default async function (fastify, _opts) {
  // GET route for registration options
  fastify.get(
    '/options/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          [StatusCodes.OK]: z.object({
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
            excludeCredentials: z.array(z.any()),
            authenticatorSelection: z.object({
              residentKey: z.string(),
              userVerification: z.string(),
              authenticatorAttachment: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
        const { id } = request.params;
        console.log('Getting registration options for user:', id);
        
        const user = await fastify.prisma.user.findUnique({ 
          where: { id },
          include: { passkeys: true }
        });
        
        if (!user) {
            return reply.notFound();
        }
        
        const rpName = "SF Lifeline";
        const rpID = "epeirogenic-audria-advantageously.ngrok-free.dev";

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userName: user.email, // Use email as username since User model doesn't have username
            userDisplayName: `${user.firstName} ${user.lastName}`,
            attestationType: 'none',
            excludeCredentials: user.passkeys.map(passkey => ({
              id: passkey.id,
              transports: passkey.transports ? passkey.transports.split(',') : undefined,
            })),
            authenticatorSelection: {
              residentKey: 'preferred',
              userVerification: 'preferred',
              authenticatorAttachment: 'platform',
            },
          });
          
          // Store options temporarily for verification
          registrationOptions.set(id, options);
          
          reply.send(options);
    }
  );

  // POST route for verifying registration
  fastify.post(
    '/verify-registration',
    {
      schema: {
        body: z.object({
          id: z.string(),
          rawId: z.string(),
          response: z.object({
            attestationObject: z.string(),
            clientDataJSON: z.string(),
          }),
          type: z.string(),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            success: z.boolean(),
            verified: z.boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id, rawId, response, type } = request.body;
      
      try {
        // Get the stored options (in production, retrieve from Redis/database)
        const options = registrationOptions.get(id);
        if (!options) {
          return reply.badRequest('Registration options not found');
        }

        const verification = await verifyRegistrationResponse({
          response: {
            id,
            rawId,
            response,
            type,
          },
          expectedChallenge: options.challenge,
          expectedOrigin: process.env.BASE_URL || 'http://localhost:3000',
          expectedRPID: 'epeirogenic-audria-advantageously.ngrok-free.dev',
        });

        if (verification.verified) {
          // Save the passkey to database
          await fastify.prisma.passkey.create({
            data: {
              id: verification.registrationInfo.credentialID,
              credPublicKey: Buffer.from(verification.registrationInfo.credentialPublicKey),
              internalUserId: id,
              webauthnUserId: verification.registrationInfo.userID,
              counter: verification.registrationInfo.counter,
              backupEligible: verification.registrationInfo.backupEligible,
              backupStatus: verification.registrationInfo.backupStatus,
              transports: verification.registrationInfo.transports?.join(','),
              createdAt: new Date(),
            },
          });

          // Clean up stored options
          registrationOptions.delete(id);
        }

        reply.send({
          success: true,
          verified: verification.verified,
        });
      } catch (error) {
        console.error('Registration verification error:', error);
        reply.send({
          success: false,
          verified: false,
        });
      }
    }
  );
}
