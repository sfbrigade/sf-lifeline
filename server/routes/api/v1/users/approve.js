import { StatusCodes } from 'http-status-codes';
import { User, Role } from '../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id/approve',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              approvedAt: { type: 'string' },
              approvedById: { type: 'string' },
              rejectedAt: { type: 'string' },
              rejectedById: { type: 'string' },
              disabledAt: { type: 'string' },
              disabledById: { type: 'string' },
            },
          },
          [StatusCodes.NOT_FOUND]: {
            type: 'null',
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const { id } = request.params;
      let data = await fastify.prisma.user.findUnique({
        where: { id },
      });
      if (!data) {
        return reply.notFound();
      }
      const user = new User(data);
      if (!user.isApproved) {
        data = await fastify.prisma.user.update({
          where: { id },
          data: {
            approvedAt: new Date(),
            approvedById: request.user.id,
            rejectedAt: null,
            rejectedById: null,
          },
        });
      }
      reply.send(data);
    }
  );
}
