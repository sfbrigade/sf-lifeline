export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'system'],
          properties: {
            name: { type: 'string' },
            category: { type: 'string', nullable: true },
            system: { type: 'string' },
            code: { type: 'string', nullable: true },
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

      const createData = {
        name: name.trim(),
        system,
        category: null,
        code: null,
      };

      if (code) {
        createData.code = code;
      }

      const newCondition = await fastify.prisma.condition.create({
        data: createData,
      });

      reply.code(201).send(newCondition);
    }
  );
}
