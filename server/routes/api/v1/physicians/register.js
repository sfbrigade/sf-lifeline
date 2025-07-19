import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const phoneRegex = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;

export default async function (fastify) {
  fastify.post(
    '/',
    {
      schema: {
        body: z.object({
          firstName: z.string().min(1, 'First name is required'),
          middleName: z.string().optional(),
          lastName: z.string().min(1, 'Last name is required'),
          email: z.string().email('Invalid email format').or(z.literal('')).optional(),
          phone: z.string()
            .min(1, 'Phone number is required')
            .regex(phoneRegex, 'Phone number must be in format (123) 456-7890'),
        }).refine(data => data.phone.trim() !== '', {
          message: 'Phone number is required',
          path: ['phone'],
        }),
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string().uuid(),
            firstName: z.string(),
            middleName: z.string().nullable(),
            lastName: z.string(),
            email: z.string().email().nullable(),
            phone: z.string().regex(phoneRegex),
          }),
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
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
          const duplicateFields = [];
          if (exists.phone === phone) {
            duplicateFields.push(`phone ${phone}`);
          }

          if (exists.email === email) {
            duplicateFields.push(`email ${email}`);
          }

          throw new Error(
            `Physician with ${duplicateFields.join(' and ')} already exists.`
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
    }
  );
}
