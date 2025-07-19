import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Role } from '#models/user.js';

const InviteResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  role: z.string(),
  expiresAt: z.coerce.date(),
  invitedById: z.string().uuid(),
  acceptedAt: z.coerce.date().nullable(),
  acceptedById: z.string().uuid().nullable(),
  revokedAt: z.coerce.date().nullable(),
  revokedById: z.string().uuid().nullable(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export default async function (fastify, _opts) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1).optional(),
          perPage: z.coerce.number().int().positive().default(25).optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(InviteResponseSchema),
        },
      },
      onRequest: fastify.requireUser(Role.ADMIN),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25' } = request.query;
      const { records, total } = await fastify.prisma.invite.paginate({
        page,
        perPage,
        orderBy: [{ createdAt: 'desc' }],
      });
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
