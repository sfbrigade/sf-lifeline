import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import {
  RegistrationVerificationRequestSchema,
  RegistrationVerificationResponseSchema,
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
  // POST /register/:id - Verify registration response
  fastify.post(
    '/register/:id',
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
}

