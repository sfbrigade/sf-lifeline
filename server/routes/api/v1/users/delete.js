import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await fastify.prisma.user.delete({
        where: { id: Number(id) },
      });

      reply.send({ message: 'User deleted successfully' });
    },
  );
}
