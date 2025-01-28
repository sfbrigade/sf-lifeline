import { StatusCodes } from 'http-status-codes';

import { Role } from '../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'null',
          },
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
