import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const PhysicianResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  hospitals: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().email().nullable(),
  })).optional(),
});

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1).optional(),
          perPage: z.coerce.number().int().positive().default(25).optional(),
          physician: z.string().default('').optional(),
          hospitalId: z.string().uuid().optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(PhysicianResponseSchema),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', physician = '', hospitalId } = request.query;

      let whereClause = {};

      const splitQuery = physician.trim().split(' ');

      if (splitQuery.length > 1) {
        whereClause = {
          AND: [
            {
              firstName: {
                contains: splitQuery[0].trim(),
                mode: 'insensitive',
              },
            },
            {
              lastName: { contains: splitQuery[1].trim(), mode: 'insensitive' },
            },
          ],
        };
      } else {
        whereClause = {
          OR: [
            { firstName: { contains: physician.trim(), mode: 'insensitive' } },
            { lastName: { contains: physician.trim(), mode: 'insensitive' } },
            {
              AND: [
                {
                  firstName: {
                    contains: physician.trim(),
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: { contains: physician.trim(), mode: 'insensitive' },
                },
              ],
            },
          ],
        };
      }

      if (hospitalId) {
        whereClause.hospitals = {
          some: {
            id: hospitalId
          }
        };
      }

      const options = {
        page,
        perPage,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        where: whereClause,
        include: { hospitals: true },
      };

      const { records, total } =
        await fastify.prisma.physician.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
