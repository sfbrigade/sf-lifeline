import { StatusCodes } from 'http-status-codes';
import User from '../../../../../models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '',
    {
      schema: {
        body: {
          type: 'object',
          required: ['passwordResetToken', 'password'],
          properties: {
            passwordResetToken: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'null',
          },
          [StatusCodes.UNAUTHORIZED]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          [StatusCodes.UNPROCESSABLE_ENTITY]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
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
          'Password Reset Link is expired or not valid',
        );
      }

      const passwordSchema = User.schema.pick({ password: true });
      try {
        passwordSchema.parse({ password: password });
      } catch (error) {
        let message = '';
        error.errors.forEach((e) => {
          if (message.length > 0) {
            message += `. ${e.message}`;
          } else {
            message = e.message;
          }
        });

        return reply.unprocessableEntity(message);
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
    },
  );
}
