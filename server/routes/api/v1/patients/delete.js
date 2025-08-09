import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid patient ID format'),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            message: z.string(),
          }),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
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
      }
    }
  );
}
