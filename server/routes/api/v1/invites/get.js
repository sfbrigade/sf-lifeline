import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid invite ID format'),
        }),
        response: {
          [StatusCodes.OK]: z.object({
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
          }),
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
