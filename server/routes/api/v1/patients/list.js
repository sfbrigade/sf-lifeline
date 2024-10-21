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
          patient: { type: 'string' },
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
      const { page = '1', perPage = '25', patient } = request.query;

      const splitQuery = patient.trim().split(' ');

      let whereClase = {};
      if (splitQuery.length > 1) {
        whereClase = {
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
        whereClase = {
          OR: [
            { firstName: { contains: patient.trim(), mode: 'insensitive' } },
            { lastName: { contains: patient.trim(), mode: 'insensitive' } },
            {
              AND: [
                {
                  firstName: {
                    contains: patient.trim(),
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: { contains: patient.trim(), mode: 'insensitive' },
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
        where: whereClase,
      };

      const { records, total } =
        await fastify.prisma.patient.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    },
  );
}
