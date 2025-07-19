import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  const phoneRegex = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;

  fastify.post(
    '/',
    {
      schema: {
        body: z.object({
          name: z.string().min(1, 'Name is required'),
          email: z.string().email('Invalid email address'),
          address: z.string().min(1, 'Address is required'),
          phone: z.string()
            .min(1, 'Phone number is required')
            .regex(phoneRegex, 'Phone number must be in format (###) ###-####'),
        }),
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            address: z.string(),
            phone: z.string(),
          }),
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
          return reply.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
