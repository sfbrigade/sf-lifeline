import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Invite } from '#models/invite.js';
import { Role } from '#models/user.js';

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
          [StatusCodes.OK]: z.array(Invite.ResponseSchema),
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
