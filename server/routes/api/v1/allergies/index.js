import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import register from './register.js';

export default async function (fastify) {
  fastify.register(register);

  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().optional(),
          perPage: z.coerce.number().optional(),
          allergy: z.string().optional(),
        }),
      },
      response: {
        [StatusCodes.OK]: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          system: z.string(),
          code: z.string(),
        })),
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', allergy } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: allergy.trim(), mode: 'insensitive' } },
      };

      const { records, total } = await fastify.prisma.allergy.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
