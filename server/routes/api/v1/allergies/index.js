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
        where: { name: { contains: allergy, mode: 'insensitive' } },
      });

      // if no results create a new alllergy and return it?

      reply.send(results);
    },
  );
}
