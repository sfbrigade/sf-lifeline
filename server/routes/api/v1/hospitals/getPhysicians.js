import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/:id/physicians',
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
      const hospitalId = request.params.id;
      const { physician } = request.query;

      const { physicians } = await fastify.prisma.hospital.findUnique({
        where: {
          id: hospitalId,
        },
        include: {
          physicians: true,
        },
      });

      const filteredPhysicians = physicians.filter((pcp) => {
        const name = pcp.firstName + ' ' + pcp.lastName;
        return name.toLowerCase().includes(physician.trim().toLowerCase());
      });

      reply.send(filteredPhysicians);
    },
  );
}
