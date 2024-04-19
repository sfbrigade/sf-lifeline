import { Role } from '../../../../models/user.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          allergy: { type: 'string' },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const allergy = request.query.allergy.trim();

      // prevent empty string from returning all allergies
      if (!allergy.length) {
        return reply.send({ message: 'No query provided' });
      }

      const results = await fastify.prisma.allergy.findMany({
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: allergy, mode: 'insensitive' } },
        select: { name: true },
      });

      reply.send(results);
    },
  );
}
