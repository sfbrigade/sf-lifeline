import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '/me',
    {
      schema: {
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              emailVerifiedAt: { type: 'string' },
              licenseNumber: { type: 'string' },
              licenseData: { type: 'object' },
              role: { type: 'string' },
              approvedAt: { type: 'string' },
              approvedById: { type: 'string' },
              rejectedAt: { type: 'string' },
              rejectedById: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser(),
    },
    async (request, reply) => {
      reply.send(request.user);
    },
  );
}
