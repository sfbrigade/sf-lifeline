import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '#models/user.js';

// Store registration options temporarily (in production, use Redis or database)
const registrationOptions = new Map();
const authenticationOptions = new Map();

export default async function (fastify, _opts) {
  // GET route for registration options
  fastify.get(
    '/options',
    {
      schema: {
        query: z.object({
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
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.query;
      const user = await fastify.prisma.user.findUnique({
        where: { id },
        include: { passkeys: true }
      });

      if (!user) {
        return reply.notFound();
      }

      const rpName = 'SF Lifeline';
      const rpID = 'localhost';

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: user.email, // Use email as username since User model doesn't have username
        userDisplayName: `${user.firstName} ${user.lastName}`,
        attestationType: 'none',
        excludeCredentials: []
          .map(passkey => ({
            id: passkey.id,
            transports: passkey.transports,
          })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      // Store options temporarily for verification
      registrationOptions.set(id, options);

      reply.send(options);
    }
  );

  // POST route for verifying registration
  fastify.post(
    '/verify-registration/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
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
      const { id: userId } = request.params;

      try {
        // Get the stored options (in production, retrieve from Redis/database)
        const options = registrationOptions.get(userId);
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
          expectedRPID: 'localhost',
        });

        if (verification.verified) {
          // Save the passkey to database
          await fastify.prisma.passkey.create({
            data: {
              id: verification.registrationInfo.credential.id,
              credPublicKey: Buffer.from(verification.registrationInfo.credential.publicKey),
              internalUserId: userId,
              webauthnUserId: verification.registrationInfo.credential.id,
              counter: verification.registrationInfo.credential.counter,
              backupEligible: verification.registrationInfo.credentialBackedUp,
              backupStatus: verification.registrationInfo.credentialBackedUp,
              transports: verification.registrationInfo.credential.transports?.join(','),
              createdAt: new Date(),
            },
          });

          // Clean up stored options
          registrationOptions.delete(userId);
        }

        reply.send({
          success: true,
          verified: verification.verified,
        });
      } catch (error) {
        console.error('Registration verification error:', error);
        reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ message: error.message });
      }
    }
  );

  fastify.get(
    '/authOptions',
    {
      response: {
        [StatusCodes.OK]: z.object({
          challenge: z.string(),
          rp: z.object({
            name: z.string(),
            id: z.string(),
          }),
        }),
      },
    },
    async (_request, reply) => {
      const options = await generateAuthenticationOptions({
        rpName: 'SF Lifeline',
        rpID: 'localhost',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });
      authenticationOptions.set(options.challenge, options);
      reply.send(options);
    }
  );

  fastify.post(
    '/authVerify',
    {
      body: z.object({
        challenge: z.string(),
      }),
      response: {
        [StatusCodes.OK]: User.ResponseSchema.openapi({
          description: 'Successfully authenticated. The response sets a cookie named `session` that should be sent in subsequent requests for authentication. This cookie will NOT appear in the web-based API tester infterface because it is an HttpOnly cookie that cannot be accessed by JavaScript.',
          headers: {
            'Set-Cookie': {
              schema: {
                type: 'string',
              },
            },
          },
        }),
      },
    },
    async (request, reply) => {
      const { challenge } = request.body;
      const options = authenticationOptions.get(challenge);
      if (!options) {
        return reply.badRequest('Authentication options not found');
      }
      const passkey = await fastify.prisma.passkey.findUnique({
        where: {
          id: request.body.id,
        },
        include: {
          user: true,
        },
      });
      if (!passkey) {
        return reply.badRequest('Passkey not found');
      }

      const verification = await verifyAuthenticationResponse({
        response: request.body,
        credential: {
          id: passkey.id,
          publicKey: passkey.credPublicKey,
          counter: passkey.counter,
          transports: passkey.transports,
        },
        expectedChallenge: options.challenge,
        expectedOrigin: process.env.BASE_URL || 'http://localhost:3000',
        expectedRPID: 'localhost',
      });

      if (verification.verified) {
        const user = passkey.user;
        request.session.set('userId', user.id);
        return reply.send(user);
      } else {
        return reply.badRequest('Authentication failed');
      }
    }
  );
}
