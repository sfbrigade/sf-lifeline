import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { User, Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().optional(),
          perPage: z.coerce.number().int().optional(),
          status: z.enum(['unapproved', 'approved', 'rejected', 'disabled']).optional(),
        }).optional(),
        response: {
          [StatusCodes.OK]: z.array(User.ResponseSchema),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', search, status } = request.query;
      const options = {
        page,
        perPage,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
          { middleName: 'asc' },
          { email: 'asc' },
        ],
        where: {}
      };
      if (search) {
        options.where.OR = [
          { lastName: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { middleName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      switch (status) {
        case 'unapproved':
          options.where.approvedAt = null;
          options.where.rejectedAt = null;
          break;
        case 'approved':
          options.where.approvedAt = { not: null };
          break;
        case 'rejected':
          options.where.rejectedAt = { not: null };
          break;
        case 'disabled':
          options.where.disabledAt = { not: null };
          break;
      }
      const { records, total } = await fastify.prisma.user.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
