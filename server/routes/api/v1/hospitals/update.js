import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Hospital } from '#models/hospital.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().min(1, 'ID is required'),
        }),
        body: Hospital.AttributesSchema,
        response: {
          [StatusCodes.OK]: Hospital.ResponseSchema,
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
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const { name, address, phone, email } = request.body;
      const hospital = await fastify.prisma.hospital.findUnique({
        where: { id },
      });
      if (!hospital) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      const updatedHospital = await fastify.prisma.hospital.update({
        where: { id },
        data: {
          name,
          address,
          phone,
          email,
          updatedById: request.user.id,
        },
      });
      if (!updatedHospital) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Failed to update hospital' });
      }
      return reply.send(updatedHospital);
    }
  );
}
