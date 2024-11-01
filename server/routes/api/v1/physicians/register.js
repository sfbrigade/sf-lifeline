import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['firstName', 'lastName', 'phone'],
          properties: {
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            email: {
              type: 'string',
              anyOf: [{ format: 'email' }, { pattern: '^$' }],
            },
            phone: {
              type: 'string',
              pattern: '^(\\([0-9]{3}\\)) [0-9]{3}-[0-9]{4}$',
            },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
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
      const { phone, email } = request.body;

      try {
        // Check if the physician already exists
        const exists = await fastify.prisma.physician.findFirst({
          where: {
            OR: [{ phone }, { email }],
          },
        });
        if (exists) {
          let duplicateFields = [];
          if (exists.phone === phone) {
            duplicateFields.push(`phone ${phone}`);
          }

          if (exists.email === email) {
            duplicateFields.push(`email ${email}`);
          }

          throw new Error(
            `Physician with ${duplicateFields.join(' and ')} already exists.`,
          );
        }

        const newPhysicianData = {};

        for (const [key, value] of Object.entries(request.body)) {
          if (value) newPhysicianData[key] = value.trim();
          if (key === 'middleName' && value.length === 0) {
            newPhysicianData[key] = null;
          }
        }

        const newPhysician = await fastify.prisma.physician.create({
          data: {
            ...newPhysicianData,
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
