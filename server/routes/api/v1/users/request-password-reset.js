import { StatusCodes } from 'http-status-codes';
import User from '../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.post(
    '/request-password-reset',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          [StatusCodes.NOT_FOUND]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const data = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (!data) {
        return reply.notFound('User not Found');
      }

      const user = new User(data);

      user.generatePasswordResetToken();
      await user.sendPasswordResetEmail();

      await fastify.prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: user.passwordResetToken,
        },
      });

      reply.send('Yes');
    },
  );
}
