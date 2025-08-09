import { StatusCodes } from 'http-status-codes';
import User from '#models/user.js';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.post(
    '',
    {
      schema: {
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          [StatusCodes.OK]: z.null(),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const data = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (!data) {
        return reply.notFound('Email not found in SF Life Line Database');
      }

      const user = new User(data);

      user.generatePasswordResetToken();
      await user.sendPasswordResetEmail();

      await fastify.prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: user.passwordResetToken,
          passwordResetExpires: new Date(
            new Date().getTime() + 30 * 60000
          ).toISOString(),
        },
      });

      reply.code(StatusCodes.OK);
    }
  );
}
