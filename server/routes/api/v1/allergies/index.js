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
      const allergy = request.query.allergy.trim();

      // prevent empty string from returning all allergies
      if (!allergy.length) {
        return
      }

      const NO_ALLERGIES = ['none', 'no allergies', 'no known allergies', 'n/a'];

      if (NO_ALLERGIES.includes(allergy.toLowerCase())) {
        return reply.send('No known allergies');
      }

      const results = await fastify.prisma.allergy.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: allergy, mode: 'insensitive' } },
        select: { name: true },
      });

      // if no results create a new alllergy and return it?

      reply.send(results);
    },
  );
}
