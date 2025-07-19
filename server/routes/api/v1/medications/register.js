import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Medication } from '#models/medication.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: Medication.AttributesSchema,
        response: {
          [StatusCodes.CREATED]: Medication.ResponseSchema,
          [StatusCodes.OK]: Medication.ResponseSchema,
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { name, altNames, system, code } = request.body;

      if (name.trim().length === 0) {
        reply.code(StatusCodes.BAD_REQUEST).send({ message: 'Name cannot be empty or just spaces.' });
        return;
      }

      const existingMedication = await fastify.prisma.medication.findFirst({
        where: {
          name: name.trim(),
        },
      });

      if (existingMedication) {
        reply.code(StatusCodes.OK).send(existingMedication);
        return;
      }

      const createData = {
        name: name.trim(),
        altNames,
        system,
        code,
        createdById: request.user.id,
        updatedById: request.user.id,
      };

      const newMedication = await fastify.prisma.medication.create({
        data: createData,
      });

      reply.code(StatusCodes.CREATED).send(newMedication);
    }
  );
}
