import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import User from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/verify',
    {
      schema: {
        body: z.object({
          emailVerificationToken: z.string(),
        }),
        response: {
          [StatusCodes.OK]: z.null(),
          [StatusCodes.NOT_FOUND]: z.null(),
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
        return reply.code(StatusCodes.NOT_FOUND).send();
      }
      if (!data) {
        return reply.code(StatusCodes.NOT_FOUND).send();
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
      reply.code(StatusCodes.OK).send();
    }
  );
}
