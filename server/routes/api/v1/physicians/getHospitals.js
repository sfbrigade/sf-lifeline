import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/:physicianId/hospital',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            hospital: { type: 'string' },
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
      const { page = '1', perPage = '25', hospital } = request.query;
      const { physicianId } = request.params;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: {
          name: {
            contains: hospital,
            mode: 'insensitive',
          },
          physicians: {
            some: {
              id: physicianId,
            },
          },
        }
      };

      const { records, total } =
        await fastify.prisma.hospital.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
