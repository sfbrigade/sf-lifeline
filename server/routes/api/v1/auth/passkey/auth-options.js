import { StatusCodes } from 'http-status-codes';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { AuthenticationOptionsResponseSchema } from '#models/passkey.js';

const rpName = process.env.WEB_AUTHN_RP_NAME;
const rpID = process.env.WEB_AUTHN_RP_ID;
const OPTIONS_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export default async function (fastify, _opts) {
  // GET /login - Generate authentication options
  fastify.get(
    '/login',
    {
      schema: {
        response: {
          [StatusCodes.OK]: AuthenticationOptionsResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const options = await generateAuthenticationOptions({
        rpName,
        rpID,
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      // Store options in database with expiration
      const expiresAt = new Date(Date.now() + OPTIONS_EXPIRY_MS);
      await fastify.prisma.authenticationOption.upsert({
        where: { challenge: options.challenge },
        create: {
          challenge: options.challenge,
          options,
          expiresAt,
        },
        update: {
          options,
          expiresAt,
        },
      });

      return reply.send(options);
    }
  );
}
