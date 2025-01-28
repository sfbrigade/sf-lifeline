import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.put(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            hasPassword: { type: 'boolean' },
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
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, email, password, hasPassword } = request.body;

      // Logic to update the user (use hasPassword for updating password)

      const user = await fastify.prisma.user.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          password,
          hasPassword,
        },
      });

      reply.send(user);
    }
  );
}
