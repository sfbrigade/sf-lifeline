import { Role } from '../../../../models/user.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          condition: { type: 'string' },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const condition = request.query.condition.trim();

      const query = {
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition, mode: 'insensitive' } },
        select: { name: true },
      }
      const results = await fastify.prisma.condition.findMany({
        take: 10,
        ...query
      });

      const { name: total } = await fastify.prisma.condition.count(query);

      const showing = `Showing ${results.length} of ${total} result${results.length === 1 ? "" : "s"}.`;

      reply.send({results, showing});
    },
  );
}
