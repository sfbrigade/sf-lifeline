import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/:physicianId/patients',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            patients: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', paitents } = request.query;
      const { physicianId } = request.params;

      const splitQuery = paitents.trim().split(' ');

      let whereClause = {};
      if (splitQuery.length > 1) {
        whereClause = {
          physicianId,
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
          physicianId,
          OR: [
            { firstName: { contains: paitents.trim(), mode: 'insensitive' } },
            { lastName: { contains: paitents.trim(), mode: 'insensitive' } },
            {
              AND: [
                {
                  firstName: {
                    contains: paitents.trim(),
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: { contains: paitents.trim(), mode: 'insensitive' },
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
        where: whereClause
      };

      const { records, total } =
        await fastify.prisma.patient.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
