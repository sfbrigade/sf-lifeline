import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: z.object({
          name: z.string().min(1, 'Name is required'),
          altNames: z.string().nullable().optional(),
          system: z.string().nullable().optional(),
          code: z.string().nullable().optional(),
        }),
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string().uuid(),
            name: z.string(),
            altNames: z.string().nullable(),
            system: z.string().nullable(),
            code: z.string().nullable(),
          }),
          [StatusCodes.OK]: z.object({
            id: z.string().uuid(),
            name: z.string(),
            altNames: z.string().nullable(),
            system: z.string().nullable(),
            code: z.string().nullable(),
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body;

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
      };

      const newMedication = await fastify.prisma.medication.create({
        data: createData,
      });

      reply.code(StatusCodes.CREATED).send(newMedication);
    }
  );
}
