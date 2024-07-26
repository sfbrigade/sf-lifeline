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
          condition: { type: 'string' },
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
              category: { type: 'string' },
              system: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', condition } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition.trim(), mode: 'insensitive' } },
      };

      const { records, total } =
        await fastify.prisma.condition.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    },
  );
}
