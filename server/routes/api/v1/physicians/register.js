import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { firstName, lastName, email, phone } = request.body;

      try {
        // Check if the physician already exists
        const exists = await fastify.prisma.physician.findFirst({
          where: { email },
        });
        if (exists) {
          throw new Error(
            `Physician with email ${email} already exists in database.`,
          );
        }

        const newPhysician = await fastify.prisma.physician.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
          },
        });

        reply.code(StatusCodes.CREATED).send(newPhysician);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return reply.status(StatusCodes.BAD_REQUEST).send({
            message: error.message,
          });
        }
        throw error;
      }
    },
  );
}
