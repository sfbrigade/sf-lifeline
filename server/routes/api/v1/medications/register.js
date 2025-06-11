import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
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

      const newMedication = await fastify.prisma.medication.create({
        data: {
          name: name.trim(),
          system: "SNOMED",
          code: "Unknown",
          altNames: "",
        },
      });

      reply.code(StatusCodes.CREATED).send(newMedication);
    }
  );
}
