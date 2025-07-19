import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.delete(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid physician ID format'),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            message: z.string(),
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
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
        const physician = await fastify.prisma.physician.findUnique({
          where: { id },
          include: {
            patients: true,
            hospitals: true
          }
        });

        if (!physician) {
          throw new Error(`Physician with ID ${id} does not exist`);
        }

        if (physician.patients.length !== 0 || physician.hospitals.length !== 0) {
          return reply.status(StatusCodes.BAD_REQUEST).send({ message: `Physician with ID ${id} has patients and hospitals assigned. Cannot delete.` });
        }

        await fastify.prisma.physician.delete({
          where: { id },
        });
        return reply.send({ message: 'Physician deleted successfully' });
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
