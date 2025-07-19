import { StatusCodes } from 'http-status-codes';

import { Hospital } from '#models/hospital.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: Hospital.AttributesSchema,
        response: {
          [StatusCodes.CREATED]: Hospital.ResponseSchema,
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { name, address, phone, email } = request.body;

      try {
        // Check if the hospital already exists
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
            ...request.body,
            createdById: request.user.id,
            updatedById: request.user.id,
          },
        });

        reply.code(StatusCodes.CREATED).send(newHospital);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
