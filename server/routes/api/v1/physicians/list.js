import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          physician: { type: 'string' },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', physician } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        where: {
          OR: [
            { firstName: { contains: physician.trim(), mode: 'insensitive' } },
            { lastName: { contains: physician.trim(), mode: 'insensitive' } },
            {
              AND: [
                {
                  firstName: {
                    contains: physician.trim(),
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: { contains: physician.trim(), mode: 'insensitive' },
                },
              ],
            },
          ],
        },
      };

      const { records, total } =
        await fastify.prisma.physician.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    },
  );
}
