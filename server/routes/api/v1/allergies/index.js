export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          allergy: { type: 'string' },
        },
      },
    },
    async (request, reply) => {
      const { allergy } = request.query;
      const results = await fastify.prisma.allergy.findMany({
        where: { name: { startsWith: allergy, mode: 'insensitive' } },
      });

      if (!results.length) {
        const other = await fastify.prisma.allergy.findFirst({
          where: {name: "Other medication or biological substance"},
        })
        reply.send(other);
        return;
      }

      reply.send(results);
    },
  );
}
