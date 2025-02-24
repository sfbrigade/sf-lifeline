import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            physician: { type: 'string' },
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
                email: { type: 'string' },
                phone: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                hospitals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', physician } = request.query;

      if (!physician) {
        const { records, total } =
          await fastify.prisma.physician.paginate({
            page,
            perPage,
            orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
            include: {
              hospitals: true
            },
          });
        reply.setPaginationHeaders(page, perPage, total).send(records);
        return;
      }

      const splitQuery = physician.trim().split(' ');

      let whereClause = {};
      if (splitQuery.length > 1) {
        whereClause = {
          AND: [
            {
              firstName: {
                contains: splitQuery[0].trim(),
                mode: 'insensitive',
              },
            },
            {
              lastName: { contains: splitQuery[1].trim(), mode: 'insensitive' },
            },
          ],
        };
      } else {
        whereClause = {
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
        };
      }
      const options = {
        page,
        perPage,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        where: whereClause,
        include: { hospitals: true },
      };

      const { records, total } =
        await fastify.prisma.physician.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
