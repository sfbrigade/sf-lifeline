import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser(Role.ADMIN),
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        await fastify.prisma.patient.delete({
          where: { id },
        });
        reply.send({ message: 'Patient deleted successfully' });
      } catch (error) {
        if (error.message.includes('does not exist')) {
          return reply.status(StatusCodes.NOT_FOUND).send({
            message: `Patient with ID ${id} does not exist in database.`,
          });
        }
        throw error;
      }
    }
  );
}
