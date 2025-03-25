import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            hospital: { type: 'string' },
            physicianId: { type: 'string' },
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
                address: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', hospital, physicianId } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { },
      };

      if (hospital) {
        options.where.name = { contains: hospital.trim(), mode: 'insensitive' };
      }

      if (physicianId) {
        options.where.physicians = {
          some: {
            id: physicianId,
          },
        };
      }

      const { records, total } =
        await fastify.prisma.hospital.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
