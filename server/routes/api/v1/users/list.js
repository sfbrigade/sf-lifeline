import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '',
    {
      schema: {
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const users = await fastify.prisma.user.findMany();
      reply.send(users);
    },
  );
}
