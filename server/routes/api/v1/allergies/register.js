import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: z.object({
          name: z.string().min(1, 'Name cannot be empty'),
          type: z.enum(['DRUG', 'OTHER']),
          system: z.string().nullable().optional(),
          code: z.string().nullable().optional(),
        }),
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string(),
            system: z.string().nullable(),
            code: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, type } = request.body;

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
        },
      });

      reply.code(StatusCodes.CREATED).send(newAllergy);
    }
  );
}
