import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { User, Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id/reject',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          [StatusCodes.OK]: User.ResponseSchema,
          [StatusCodes.NOT_FOUND]: z.null(),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const { id } = request.params;
      let data = await fastify.prisma.user.findUnique({
        where: { id },
      });
      if (!data) {
        return reply.notFound();
      }
      const user = new User(data);
      if (!user.isRejected) {
        data = await fastify.prisma.user.update({
          where: { id },
          data: {
            approvedAt: null,
            approvedById: null,
            rejectedAt: new Date(),
            rejectedById: request.user.id,
          },
        });
      }
      reply.send(data);
    }
  );
}
