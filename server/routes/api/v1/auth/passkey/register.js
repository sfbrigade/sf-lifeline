import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '#models/user.js';
import {
  RegistrationVerificationRequestSchema,
  RegistrationVerificationResponseSchema,
  AuthenticationVerificationRequestSchema,
} from '#models/passkey.js';

const rpID = process.env.WEB_AUTHN_RP_ID;
const rpOrigin = process.env.BASE_URL;

// Helper function to clean up expired options
async function cleanupExpiredOption (prisma, table, where) {
  try {
    await prisma[table].delete({ where }).catch(() => {
      // Ignore errors if already deleted or doesn't exist
    });
  } catch {
    // Ignore all errors
  }
}

export default async function (fastify, _opts) {
  // POST /verify-registration/:id - Verify registration response
  fastify.post(
    '/verify-registration/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: RegistrationVerificationRequestSchema,
        response: {
          [StatusCodes.OK]: RegistrationVerificationResponseSchema,
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
          [StatusCodes.UNPROCESSABLE_ENTITY]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id, rawId, response, type } = request.body;
      const { id: userId } = request.params;

      try {
        // Get the stored options from database
        const storedOption = await fastify.prisma.registrationOption.findUnique({
          where: { id: userId },
        });

        if (!storedOption || storedOption.expiresAt < new Date()) {
          // Clean up expired option if it exists
          if (storedOption) {
            await cleanupExpiredOption(fastify.prisma, 'registrationOption', { id: userId });
          }
          return reply.badRequest('Registration options not found or expired');
        }

        const options = storedOption.options;

        const verification = await verifyRegistrationResponse({
          response: {
            id,
            rawId,
            response,
            type,
          },
          expectedChallenge: options.challenge,
          expectedOrigin: rpOrigin,
          expectedRPID: rpID,
        });

        if (verification.verified) {
          // Save the passkey to database
          await fastify.prisma.passkey.create({
            data: {
              id: verification.registrationInfo.credential.id,
              credPublicKey: Buffer.from(verification.registrationInfo.credential.publicKey),
              internalUserId: userId,
              counter: verification.registrationInfo.credential.counter,
              backupEligible: verification.registrationInfo.credentialBackedUp,
              backupStatus: verification.registrationInfo.credentialBackedUp,
              transports: verification.registrationInfo.credential.transports?.join(','),
              createdAt: new Date(),
            },
          });

          // Clean up stored options
          await cleanupExpiredOption(fastify.prisma, 'registrationOption', { id: userId });
        }

        return reply.send({
          success: true,
          verified: verification.verified,
        });
      } catch (error) {
        fastify.log.error({ error }, 'Registration verification error');
        return reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
          message: error.message || 'Registration verification failed',
        });
      }
    }
  );

  // POST /authVerify - Verify authentication response
  fastify.post(
    '/authVerify',
    {
      schema: {
        body: AuthenticationVerificationRequestSchema,
        response: {
          [StatusCodes.OK]: User.ResponseSchema.openapi({
            description:
              'Successfully authenticated. The response sets a cookie named `session` that should be sent in subsequent requests for authentication. This cookie will NOT appear in the web-based API tester interface because it is an HttpOnly cookie that cannot be accessed by JavaScript.',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                },
              },
            },
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { challenge, id } = request.body;

      try {
        // Get the stored options from database
        const storedOption = await fastify.prisma.authenticationOption.findUnique({
          where: { challenge },
        });

        if (!storedOption || storedOption.expiresAt < new Date()) {
          // Clean up expired option if it exists
          if (storedOption) {
            await cleanupExpiredOption(fastify.prisma, 'authenticationOption', { challenge });
          }
          return reply.badRequest('Authentication options not found or expired');
        }

        const options = storedOption.options;

        const passkey = await fastify.prisma.passkey.findUnique({
          where: { id },
          include: { user: true },
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
          expectedOrigin: rpOrigin,
          expectedRPID: rpID,
        });

        if (!verification.verified) {
          return reply.badRequest('Authentication failed');
        }

        // Clean up stored options
        await cleanupExpiredOption(fastify.prisma, 'authenticationOption', { challenge });

        // Update passkey counter
        await fastify.prisma.passkey.update({
          where: { id: passkey.id },
          data: {
            counter: verification.authenticationInfo.newCounter,
            lastUsed: new Date(),
          },
        });

        request.session.set('userId', passkey.user.id);
        return reply.send(passkey.user);
      } catch (error) {
        return reply.badRequest('Authentication verification failed');
      }
    }
  );
}
