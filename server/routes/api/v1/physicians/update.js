import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Physician } from '#models/physician.js';
import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid physician ID format'),
        }),
        body: Physician.AttributesSchema,
        response: {
          [StatusCodes.OK]: Physician.ResponseSchema,
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([
        Role.ADMIN,
        Role.STAFF,
        Role.VOLUNTEER
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
          data: {
            ...body,
            updatedById: request.user.id,
          },
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
