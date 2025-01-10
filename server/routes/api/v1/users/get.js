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
            type: 'null',
          },
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
    },
  );
}
