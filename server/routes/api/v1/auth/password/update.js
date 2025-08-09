import { StatusCodes } from 'http-status-codes';
import User from '#models/user.js';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.patch(
    '',
    {
      schema: {
        body: z.object({
          passwordResetToken: z.string(),
          password: User.PasswordSchema,
        }),
        response: {
          [StatusCodes.OK]: z.null(),
          [StatusCodes.UNAUTHORIZED]: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { passwordResetToken, password } = request.body;

      const data = await fastify.prisma.user.findUnique({
        where: { passwordResetToken },
      });

      if (!data) {
        return reply.unauthorized(
          'Password Reset Link is expired or not valid'
        );
      }

      const user = new User(data);

      await user.setPassword(password);

      await fastify.prisma.user.update({
        where: { passwordResetToken },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
          hashedPassword: user.hashedPassword,
        },
      });
      await user.sendPasswordResetSuccessEmail();

      reply.code(StatusCodes.OK);
    }
  );
}
