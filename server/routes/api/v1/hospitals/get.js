import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/:id',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
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
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const record = await fastify.prisma.hospital.findUnique({
        where: { id }
      });
      if (!record) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      reply.send(record);
    }
  );
}
