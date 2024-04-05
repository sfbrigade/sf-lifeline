export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          medication: { type: 'string' },
        },
      },
    },
    async (request, reply) => {
      const { medication } = request.query;
      const results = await fastify.prisma.medication.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: medication, mode: 'insensitive' } },
      });

      // if no results create a new medication and return it?

      reply.send(results);
    },
  );
}
