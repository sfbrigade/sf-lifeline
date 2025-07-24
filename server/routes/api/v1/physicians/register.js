import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Physician } from '#models/physician.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: Physician.AttributesSchema,
        response: {
          [StatusCodes.CREATED]: Physician.ResponseSchema,
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
      const { phone, email } = request.body;

      try {
        // Check if the physician already exists
        const exists = await fastify.prisma.physician.findFirst({
          where: {
            OR: [{ phone }, { email }],
          },
        });
        if (exists) {
          const duplicateFields = [];
          if (exists.phone === phone) {
            duplicateFields.push(`phone ${phone}`);
          }

          if (exists.email === email) {
            duplicateFields.push(`email ${email}`);
          }

          throw new Error(
            `Physician with ${duplicateFields.join(' and ')} already exists.`
          );
        }

        const newPhysicianData = {};

        for (const [key, value] of Object.entries(request.body)) {
          if (value) newPhysicianData[key] = value.trim();
          if (key === 'middleName' && value.length === 0) {
            newPhysicianData[key] = null;
          }
        }

        const newPhysician = await fastify.prisma.physician.create({
          data: {
            ...newPhysicianData,
            createdById: request.user.id,
            updatedById: request.user.id,
          },
        });

        reply.code(StatusCodes.CREATED).send(newPhysician);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return reply.status(StatusCodes.BAD_REQUEST).send({
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
