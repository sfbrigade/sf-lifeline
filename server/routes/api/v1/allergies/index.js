import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          page: { type: 'integer' },
          perPage: { type: 'integer' },
          allergy: { type: 'string' },
        },
      },
      response: {
        [StatusCodes.OK]: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              system: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', allergy } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [
          { name: 'asc' },
        ],
        where: { name: { contains: allergy.trim(), mode: 'insensitive' } },
      };

      const { records, total } = await fastify.prisma.allergy.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    },
  );
}
