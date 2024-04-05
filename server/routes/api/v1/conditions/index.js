export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          condition: { type: 'string' },
        },
      },
    },
    async (request, reply) => {
      const { condition } = request.query;
      const results = await fastify.prisma.condition.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition, mode: 'insensitive' } },
      });

      // if no results create a new condition and return it?

      reply.send(results);
    },
  );
}
