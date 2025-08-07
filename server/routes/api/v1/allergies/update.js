import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import Allergy from '#models/allergy.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().min(1, 'ID is required'),
        }),
        body: Allergy.AttributesSchema,
        response: {
          [StatusCodes.OK]: Allergy.ResponseSchema,
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
          [StatusCodes.INTERNAL_SERVER_ERROR]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const { name, type, system, code } = request.body;
      const allergy = await fastify.prisma.allergy.findUnique({
        where: { id },
      });
      if (!allergy) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Allergy not found' });
      }
      const updatedAllergy = await fastify.prisma.allergy.update({
        where: { id },
        data: {
          name,
          type,
          system,
          code,
          updatedById: request.user.id,
        },
      });
      if (!updatedAllergy) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Failed to update allergy' });
      }
      return reply.send(updatedAllergy);
    }
  );
}
