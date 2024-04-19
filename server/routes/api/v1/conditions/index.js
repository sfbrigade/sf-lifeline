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

      if (!condition.length) {
        return reply.send({ message: 'No query provided' });
      }

      const results = await fastify.prisma.condition.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition, mode: 'insensitive' } },
        select: { name: true },
      });

      reply.send(results);
    },
  );
}
