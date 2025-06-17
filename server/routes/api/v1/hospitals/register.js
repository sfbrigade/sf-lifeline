import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'phone', 'address'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            address: {
              type: 'string',
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
              name: { type: 'string' },
              email: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { name, address, phone, email } = request.body;

      try {
        // Check if the physician already exists
        const exists = await fastify.prisma.hospital.findFirst({
          where: {
            OR: [{ phone }, { email }, { name }, { address }],
          },
        });
        if (exists) {
          const duplicateFields = [];
          if (exists.name === name) {
            duplicateFields.push(`name ${name}`);
          }
          if (exists.address === address) {
            duplicateFields.push(`address ${name}`);
          }
          if (exists.phone === phone) {
            duplicateFields.push(`phone ${phone}`);
          }

          if (exists.email === email) {
            duplicateFields.push(`email ${email}`);
          }

          throw new Error(
            `Hospital with ${duplicateFields.join(' and ')} already exists.`
          );
        }

        const newHospital = await fastify.prisma.hospital.create({
          data: {
            ...request.body
          },
        });

        reply.code(StatusCodes.CREATED).send(newHospital);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return reply.status(StatusCodes.BAD_REQUEST).send({
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
