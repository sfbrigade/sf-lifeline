import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const MedicationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  altNames: z.string().nullable(),
  system: z.string(),
  code: z.string(),
});

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
          [StatusCodes.OK]: z.array(MedicationResponseSchema),
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
