import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['DRUG', 'OTHER'] },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              system: { type: 'string' },
              code: { type: 'string' },
            },
          },
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
          system: 'SNOMED',
          code: 'Unknown',
        },
      });

      reply.code(StatusCodes.CREATED).send(newAllergy);
    }
  );
}
