import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
              invitedById: { type: 'string', format: 'uuid' },
              acceptedAt: { type: 'string', format: 'date-time' },
              acceptedById: { type: 'string', format: 'uuid' },
              revokedAt: { type: 'string', format: 'date-time' },
              revokedById: { type: 'string', format: 'uuid' },
              updatedAt: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
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
    },
  );
}
