import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import User from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '/notification',
    {
      schema: {
        response: {
          [StatusCodes.OK]: z.object({
            patientNotification: z.boolean(),
          }),
        },
      },
      onRequest: fastify.requireUser([User.Role.ADMIN, User.Role.STAFF, User.Role.VOLUNTEER, User.Role.FIRST_RESPONDER]),
    },
    async (request, reply) => {
      const userId = request.user.id;

      try {
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          select: {
            patientNotification: true,
          },
        });

        if (!user) {
          return reply.code(StatusCodes.NOT_FOUND).send({
            error: 'Not Found',
            message: 'User not found',
          });
        }

        return reply.code(StatusCodes.OK).send({
          patientNotification: user.patientNotification,
        });
      } catch (error) {
        return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: 'Internal Server Error',
          message: 'Failed to get notification preferences',
        });
      }
    }
  );

  fastify.patch(
    '/notification',
    {
      schema: {
        body: z.object({
          patientNotification: z.boolean(),
        }),
        response: {
          [StatusCodes.OK]: z.object({
            message: z.string(),
            patientNotification: z.boolean(),
          }),
        },
      },
      onRequest: fastify.requireUser([User.Role.ADMIN, User.Role.STAFF, User.Role.VOLUNTEER, User.Role.FIRST_RESPONDER]),
    },
    async (request, reply) => {
      const { patientNotification } = request.body;
      const userId = request.user.id;

      try {
        const updatedUser = await fastify.prisma.user.update({
          where: { id: userId },
          data: { patientNotification },
          select: {
            patientNotification: true,
          },
        });

        return reply.code(StatusCodes.OK).send({
          message: 'Notification preferences updated successfully',
          patientNotification: updatedUser.patientNotification,
        });
      } catch (error) {
        return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: 'Internal Server Error',
          message: 'Failed to update notification preferences',
        });
      }
    }
  );
}
