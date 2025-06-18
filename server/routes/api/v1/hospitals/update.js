import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.patch(
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
              email: { type: 'string' }
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const { name, address, phone, email } = request.body;
      const hospital = await fastify.prisma.hospital.findUnique({
        where: { id },
      });
      if (!hospital) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      const updatedHospital = await fastify.prisma.hospital.update({
        where: { id },
        data: {
          name,
          address,
          phone,
          email,
        },
      });
      if (!updatedHospital) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Failed to update hospital' });
      }
      return reply.send(updatedHospital);
    }
  );
}
