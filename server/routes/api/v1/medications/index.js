import { Role } from '../../../../models/user.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          medication: { type: 'string' },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const medication = request.query.medication.trim();

      const query = {
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: medication, mode: 'insensitive' } },
        select: { name: true },
      }

      const results = await fastify.prisma.medication.findMany({
        take: 10,
        ...query
      });

      const { name: total } = await fastify.prisma.medication.count(query);

      const showing = `Showing ${results.length} of ${total} result${results.length === 1 ? "" : "s"}.`;

      reply.send({results, showing});
    },
  );
}
