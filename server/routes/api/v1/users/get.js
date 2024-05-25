import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
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
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              hasPassword: { type: 'boolean' },
            },
          },
          [StatusCodes.NOT_FOUND]: {
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
      const user = await fastify.prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        reply.code(StatusCodes.NOT_FOUND).send({ message: 'User not found' });
        return;
      }

      reply.send(user);
    },
  );
}
