import { StatusCodes } from 'http-status-codes';

import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            perPage: { type: 'integer' },
          },
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
      onRequest: fastify.requireUser(Role.ADMIN),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25' } = request.query;
      const { records, total } = await fastify.prisma.invite.paginate({
        page,
        perPage,
        orderBy: [{ createdAt: 'desc' }],
      });
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
