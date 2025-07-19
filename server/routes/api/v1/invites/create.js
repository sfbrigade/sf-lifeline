import { DateTime } from 'luxon';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Role } from '#models/user.js';
import Invite from '#models/invite.js';

export default async function (fastify, _opts) {
  fastify.post(
    '',
    {
      schema: {
        body: z.object({
          recipients: z.string().min(1, 'Recipients are required'),
          role: z.string().min(1, 'Role is required'),
        }),
        response: {
          [StatusCodes.CREATED]: z.array(z.object({
            id: z.string().uuid(),
            firstName: z.string().nullable(),
            middleName: z.string().nullable(),
            lastName: z.string().nullable(),
            email: z.string().email(),
            role: z.string(),
            expiresAt: z.coerce.date(),
            invitedById: z.string().uuid(),
            acceptedAt: z.coerce.date().nullable(),
            acceptedById: z.string().uuid().nullable(),
            revokedAt: z.coerce.date().nullable(),
            revokedById: z.string().uuid().nullable(),
            updatedAt: z.coerce.date(),
            createdAt: z.coerce.date(),
          })),
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
            /(?:"?([^"<@\n]+)"? ?<)?([^@< ,\n]+@[^ ,>\n]+)>?/g
          ),
        ].map(async (match) => {
          const [, fullName, email] = match;
          let data = {
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
          data = await fastify.prisma.invite.create({ data });
          const invite = new Invite(data);
          await invite.sendInviteEmail();
          return data;
        })
      );
      reply.code(StatusCodes.CREATED).send(payload);
    }
  );
}
