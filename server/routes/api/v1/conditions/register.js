export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'category', 'system', 'code'],
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            system: { type: 'string' },
            code: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              category: { type: 'string' },
              system: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, category, system, code } = request.body;

      try {
        const existingCondition = await fastify.prisma.condition.findFirst({
          where: {
            name: name.trim(),
            category,
            system,
            code,
          },
        });

        if (existingCondition) {
          reply.code(200).send(existingCondition);
          return;
        }

        const newCondition = await fastify.prisma.condition.create({
          data: {
            name: name.trim(),
            category,
            system,
            code,
          },
        });

        reply.code(201).send(newCondition);
      } catch (error) {
        throw error;
      }
    }
  );
}
