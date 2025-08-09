import { StatusCodes } from 'http-status-codes';

import { Allergy } from '#models/allergy.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: Allergy.AttributesSchema,
        response: {
          [StatusCodes.CREATED]: Allergy.ResponseSchema,
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { name, type, system, code } = request.body;

      if (name.trim().length === 0) {
        reply.code(StatusCodes.BAD_REQUEST).send({ message: 'Name cannot be empty or just spaces.' });
        return;
      }

      const existingAllergy = await fastify.prisma.allergy.findFirst({
        where: {
          name: name.trim(),
          type,
        },
      });

      if (existingAllergy) {
        reply.code(StatusCodes.OK).send(existingAllergy);
        return;
      }

      const newAllergy = await fastify.prisma.allergy.create({
        data: {
          name: name.trim(),
          type,
          system,
          code,
          createdById: request.user.id,
          updatedById: request.user.id,
        },
      });

      reply.code(StatusCodes.CREATED).send(newAllergy);
    }
  );
}
