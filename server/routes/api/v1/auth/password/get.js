import { StatusCodes } from 'http-status-codes';
import User from '#models/user.js';
import { z } from 'zod';

export default async function (fastify, _opts) {
  fastify.get(
    '/:token',
    {
      schema: {
        params: z.object({
          token: z.string(),
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
      const { token } = request.params;

      let data;
      try {
        data = await fastify.prisma.user.findUnique({
          where: { passwordResetToken: token },
        });
      } catch (error) {
        return reply.unauthorized(
          'Password Reset Link is expired or not valid'
        );
      }

      if (!data) {
        return reply.unauthorized(
          'Password Reset Link is expired or not valid'
        );
      }

      const user = new User(data);

      if (!user.isPasswordResetTokenValid) {
        return reply.unauthorized(
          'Password Reset Link is expired or not valid'
        );
      }

      reply.code(StatusCodes.OK);
    }
  );
}
