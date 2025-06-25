import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await fastify.prisma.user.delete({
        where: { id: Number(id) },
      });

      reply.send({ message: 'User deleted successfully' });
    }
  );
}
