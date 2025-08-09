import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Invite } from '#models/invite.js';
import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid invite ID format'),
        }),
        response: {
          [StatusCodes.OK]: Invite.ResponseSchema,
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser(Role.ADMIN),
    },
    async (request, reply) => {
      const { id } = request.params;
      let invite = await fastify.prisma.invite.findUnique({
        where: { id },
      });
      if (!invite) {
        return reply.notFound();
      }
      if (!invite.revokedAt) {
        invite = await fastify.prisma.invite.update({
          where: { id },
          data: {
            revokedAt: new Date(),
            revokedById: request.user.id,
          },
        });
      }
      reply.send(invite);
    }
  );
}
