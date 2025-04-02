import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
              licenseNumber: { type: 'string' },
              licenseData: { type: 'object' },
              approvedAt: { type: 'string', format: 'date-time' },
              approvedById: { type: 'string', format: 'uuid' },
              rejectedAt: { type: 'string', format: 'date-time' },
              rejectedById: { type: 'string', format: 'uuid' },
              disabledAt: { type: 'string', format: 'date-time' },
              disabledById: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          [StatusCodes.NOT_FOUND]: {
            type: 'null',
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const data = await fastify.prisma.user.findUnique({
        where: { id },
      });

      if (!data) {
        return reply.notFound();
      }

      reply.send(data);
    }
  );
}
