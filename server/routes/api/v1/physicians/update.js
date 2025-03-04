import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
      response: {
        [StatusCodes.OK]: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' }
          },
        },
        [StatusCodes.NOT_FOUND]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
      onRequest: fastify.requireUser([
        Role.ADMIN,
        Role.STAFF,
        Role.VOLUNTEER,
        Role.FIRST_RESPONDER,
      ]),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { body } = request;

      try {
        const physician = await fastify.prisma.physician.findUnique({
          where: { id }
        });
        if (!physician) throw new Error('Physician not found');

        const updatedPhysician = await fastify.prisma.physician.update({
          where: { id },
          data: body,
        });

        return reply.code(StatusCodes.OK).send(updatedPhysician);
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Physician with ID ${id} does not exist in database.`,
        });
      }
    }
  );
}
