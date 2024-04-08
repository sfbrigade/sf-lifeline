import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          page: { type: 'integer' },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
                InvitedById: { type: 'string', format: 'uuid' },
                acceptedAt: { type: 'string', format: 'date-time' },
                AcceptedById: { type: 'string', format: 'uuid' },
                revokedAt: { type: 'string', format: 'date-time' },
                RevokedById: { type: 'string', format: 'uuid' },
                updatedAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { page = '1' } = request.query;
      const { records, total } = await fastify.prisma.invite.paginate({ page });
      reply.send(records);
    },
  );
}
