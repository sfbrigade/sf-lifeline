import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import User from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
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
    },
    async (request, reply) => {
      const { id } = request.params;
      const data = await fastify.prisma.user.findUnique({
        where: { id },
      });

      if (!data) {
        return reply.notFound();
      }

      reply.send(data);
    }
  );
}
