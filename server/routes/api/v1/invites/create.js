import { DateTime } from 'luxon';
import { StatusCodes } from 'http-status-codes';

import { Role } from '../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.post(
    '',
    {
      schema: {
        body: {
          type: 'object',
          required: ['recipients', 'role'],
          properties: {
            recipients: { type: 'string' },
            role: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
                invitedById: { type: 'string', format: 'uuid' },
                acceptedAt: { type: 'string', format: 'date-time' },
                acceptedById: { type: 'string', format: 'uuid' },
                revokedAt: { type: 'string', format: 'date-time' },
                revokedById: { type: 'string', format: 'uuid' },
                updatedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser(Role.ADMIN),
    },
    async (request, reply) => {
      const { recipients, role } = request.body;
      const expiresAt = DateTime.now().plus({ weeks: 1 }).toISO();
      const payload = await Promise.all(
        [
          ...recipients.matchAll(
            /(?:"?([^"<@\n]+)"? ?<)?([^@< ,\n]+@[^ ,>\n]+)>?/g,
          ),
        ].map(async (match) => {
          const [, fullName, email] = match;
          const data = {
            email,
            role,
            expiresAt,
            invitedById: request.user.id,
          };
          if (fullName) {
            const names = fullName.trim().split(' ');
            if (names.length > 0) {
              data.firstName = names.shift();
            }
            if (names.length > 1) {
              data.middleName = names.shift();
            }
            if (names.length > 0) {
              data.lastName = names.join(' ');
            }
          }
          const invite = await fastify.prisma.invite.create({ data });
          // TODO: send email
          return invite;
        }),
      );
      reply.code(StatusCodes.CREATED).send(payload);
    },
  );
}
