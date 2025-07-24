import { StatusCodes } from 'http-status-codes';

import { Condition } from '#models/condition.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: Condition.AttributesSchema,
        response: {
          [StatusCodes.CREATED]: Condition.ResponseSchema,
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { name, category, system, code } = request.body;

      if (name.trim().length === 0) {
        reply.code(StatusCodes.BAD_REQUEST).send({ message: 'Name cannot be empty or just spaces.' });
        return;
      }

      const existingCondition = await fastify.prisma.condition.findFirst({
        where: {
          name: name.trim(),
        },
      });

      if (existingCondition) {
        reply.code(StatusCodes.OK).send(existingCondition);
        return;
      }

      const createData = {
        name: name.trim(),
        category,
        system,
        code,
        createdById: request.user.id,
        updatedById: request.user.id,
      };

      const newCondition = await fastify.prisma.condition.create({
        data: createData,
      });

      reply.code(StatusCodes.CREATED).send(newCondition);
    }
  );
}
