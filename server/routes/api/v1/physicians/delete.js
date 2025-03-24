import { Role } from '../../../../models/user.js';
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
        const physician = await fastify.prisma.physician.findUnique({
          where: { id },
        });

        if (physician.patients.length !== 0 && physician.hospitals.length !== 0) {
          return reply.status(StatusCodes.BAD_REQUEST).send({ message: `Physician with ID ${id} has patients and hospitals assigned. Cannot delete.` });
        }
        await fastify.prisma.physician.delete({
          where: { id },
        });
        reply.send({ message: 'Physician deleted successfully' });
      } catch (error) {
        if (error.message.includes('does not exist')) {
          return reply.status(StatusCodes.NOT_FOUND).send({
            message: `Physician with ID ${id} does not exist in database.`,
          });
        }
        throw error;
      }
    }
  );
}
