import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { generateRegistrationOptions } from '@simplewebauthn/server';

const rpName = process.env.WEB_AUTHN_RP_NAME;
const rpID = process.env.WEB_AUTHN_RP_ID;
const OPTIONS_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export default async function (fastify, _opts) {
  // GET /register - Generate registration options
  fastify.get(
    '/register',
    {
      schema: {
        query: z.object({
          id: z.string().uuid(),
        }),
        response: {
          [StatusCodes.OK]: z.any(),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.query;

      const user = await fastify.prisma.user.findUnique({
        where: { id },
        include: { passkeys: true },
      });

      if (!user) {
        return reply.notFound();
      }

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: user.email,
        userDisplayName: `${user.firstName} ${user.lastName}`,
        attestationType: 'none',
        excludeCredentials: user.passkeys.map((passkey) => ({
          id: passkey.id,
          transports: passkey.transports ? [passkey.transports] : undefined,
        })),
        preferredAuthenticatorType: 'localDevice',
        authenticatorSelection: {
          userVerification: 'required',
          residentKey: 'required'
        },
      });

      // Store options in database with expiration
      const expiresAt = new Date(Date.now() + OPTIONS_EXPIRY_MS);
      await fastify.prisma.registrationOption.upsert({
        where: { id },
        create: {
          id,
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
