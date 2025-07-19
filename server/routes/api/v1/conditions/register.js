import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: z.object({
          name: z.string().min(1, 'Name cannot be empty'),
          category: z.string().nullable().optional(),
          system: z.string().min(1, 'System cannot be empty'),
          code: z.string().nullable().optional(),
        }),
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string().uuid(),
            name: z.string(),
            category: z.string().nullable(),
            system: z.string(),
            code: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, system } = request.body;

      if (name.trim().length === 0) {
        reply.code(StatusCodes.BAD_REQUEST).send({ message: 'Name cannot be empty or just spaces.' });
        return;
      }

      const existingCondition = await fastify.prisma.condition.findFirst({
        where: {
          name: name.trim(),
          system,
        },
      });

      if (existingCondition) {
        reply.code(StatusCodes.OK).send(existingCondition);
        return;
      }

      const createData = {
        name: name.trim(),
        system,
      };

      const newCondition = await fastify.prisma.condition.create({
        data: createData,
      });

      reply.code(StatusCodes.CREATED).send(newCondition);
    }
  );
}
