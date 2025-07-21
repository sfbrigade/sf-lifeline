import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Invite } from '#models/invite.js';

export default async function (fastify, _opts) {
  fastify.get(
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
    },
    async (request, reply) => {
      const { id } = request.params;
      const invite = await fastify.prisma.invite.findUnique({
        where: { id },
      });
      if (!invite) {
        return reply.notFound();
      }
      reply.send(invite);
    }
  );
}
