import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/:id/physicians',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Hospital ID must be a valid UUID'),
        }),
        body: z.object({
          physicianIds: z.array(z.string().uuid()).min(1, 'At least one physician is required'),
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
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { physicianIds } = request.body;

      const hospital = await fastify.prisma.hospital.findUnique({
        where: { id },
        select: {
          id: true,
          physicians: {
            select: { id: true },
          },
        },
      });

      if (!hospital) {
        return reply
          .status(StatusCodes.NOT_FOUND)
          .send({ message: 'Hospital not found' });
      }

      const uniqueIds = [...new Set(physicianIds)];

      const physicians = await fastify.prisma.physician.findMany({
        where: {
          id: {
            in: uniqueIds,
          },
        },
        select: { id: true },
      });

      if (physicians.length !== uniqueIds.length) {
        return reply.status(StatusCodes.BAD_REQUEST).send({
          message: 'One or more physicians could not be found.',
        });
      }

      const existingIds = new Set(hospital.physicians.map((entry) => entry.id));
      const toConnect = uniqueIds.filter((physicianId) => !existingIds.has(physicianId));

      if (toConnect.length === 0) {
        return reply.send({
          message: 'Selected physicians are already linked to this hospital.',
        });
      }

      await fastify.prisma.hospital.update({
        where: { id },
        data: {
          physicians: {
            connect: toConnect.map((physicianId) => ({ id: physicianId })),
          },
          updatedById: request.user.id,
        },
      });

      return reply.send({
        message: 'Physicians linked successfully.',
      });
    }
  );
}
