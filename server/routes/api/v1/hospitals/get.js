import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Hospital } from '#models/hospital.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().min(1, 'Hospital ID is required'),
        }),
        response: {
          [StatusCodes.OK]: Hospital.ResponseSchema,
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const record = await fastify.prisma.hospital.findUnique({
        where: { id }
      });
      if (!record) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      reply.send(record);
    }
  );
}
