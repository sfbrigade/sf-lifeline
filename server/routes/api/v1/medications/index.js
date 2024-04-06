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
      const medication = request.query.medication.trim();

      if (!medication.length) {
        return reply.send({ message: 'No query provided' });
      }

      const NO_MEDICATIONS = ['none', 'no medications', 'no known medications', 'n/a'];

      if (NO_MEDICATIONS.includes(medication.toLowerCase())) {
        return reply.send('No known medications');
      }

      const results = await fastify.prisma.medication.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: medication, mode: 'insensitive' } },
        select: { name: true },
      });

      if (!results.length) {
        return reply.send({ message: 'No results found in the database' });
      }

      reply.send(results);
    },
  );
}
