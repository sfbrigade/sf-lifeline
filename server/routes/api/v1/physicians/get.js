import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid physician ID format'),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            id: z.string().uuid(),
            firstName: z.string(),
            middleName: z.string().nullable(),
            lastName: z.string(),
            phone: z.string().nullable(),
            email: z.string().email().nullable(),
          }),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
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
          where: { id }
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
