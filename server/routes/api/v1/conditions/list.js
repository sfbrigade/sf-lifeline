import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Role } from '#models/user.js';
import { Condition } from '#models/condition.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().optional(),
          perPage: z.coerce.number().int().optional(),
          condition: z.string().optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(Condition.ResponseSchema),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', condition } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition.trim(), mode: 'insensitive' } },
      };

      const { records, total } =
        await fastify.prisma.condition.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
