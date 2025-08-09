import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Medication } from '#models/medication.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1).optional(),
          perPage: z.coerce.number().int().positive().default(25).optional(),
          medication: z.string().default('').optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(Medication.ResponseSchema),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', medication } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: medication.trim(), mode: 'insensitive' } },
      };

      const { records, total } = await fastify.prisma.medication.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
