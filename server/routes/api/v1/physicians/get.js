import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
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
            email: { type: 'string' },
            patients: { type: 'array' },
            hospitals: { type: 'array' },
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

      try {
        const physician = await fastify.prisma.physician.findUnique({
          where: { id },
          include: {
            patients: true,
            hospitals: true,
          }
        });
        if (!physician) throw new Error('Physician not found');

        return reply.code(StatusCodes.OK).send(physician);
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Physician with ID ${id} does not exist in database.`,
        });
      }
    }
  );
}
