import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { User, Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id/disable',
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
      if (!user.isDisabled) {
        data = await fastify.prisma.user.update({
          where: { id },
          data: {
            disabledAt: new Date(),
            disabledById: request.user.id,
          },
        });
      }
      reply.send(data);
    }
  );
}
