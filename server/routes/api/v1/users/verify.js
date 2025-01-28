import { StatusCodes } from 'http-status-codes';
import User from '../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/verify',
    {
      schema: {
        body: {
          type: 'object',
          required: ['emailVerificationToken'],
          properties: {
            emailVerificationToken: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'null',
          },
          [StatusCodes.NOT_FOUND]: {
            type: 'null',
          },
        },
      },
    },
    async (request, reply) => {
      const { emailVerificationToken } = request.body;
      let data;
      try {
        data = await fastify.prisma.user.findUnique({
          where: { emailVerificationToken },
        });
      } catch (error) {
        return reply.notFound();
      }
      if (!data) {
        return reply.notFound();
      }
      const user = new User(data);

      if (!user.isEmailVerified) {
        data = await fastify.prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
          },
        });
      }
      reply.code(StatusCodes.OK);
    }
  );
}
