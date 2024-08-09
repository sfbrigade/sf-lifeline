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

      let data = await fastify.prisma.user.findMany({
        where: { emailVerificationToken: emailVerificationToken },
      });
      if (data.length == 0) {
        return reply.notFound();
      }
      const user = new User(data[0]);

      if (!user.isEmailVerified) {
        data = await fastify.prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: new Date(),
          },
        });
      }
      reply.code(StatusCodes.OK);
    },
  );
}
