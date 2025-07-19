import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const phoneRegex = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid physician ID format'),
        }),
        body: z.object({
          firstName: z.string().min(1, 'First name is required').optional(),
          middleName: z.string().optional(),
          lastName: z.string().min(1, 'Last name is required').optional(),
          email: z.string().email('Invalid email format').or(z.literal('')).optional(),
          phone: z.string()
            .regex(phoneRegex, 'Phone number must be in format (123) 456-7890')
            .optional(),
        }).refine(data => Object.keys(data).length > 0, {
          message: 'At least one field must be provided for update',
        }),
        response: {
          [StatusCodes.OK]: z.object({
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
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([
        Role.ADMIN,
        Role.STAFF,
        Role.VOLUNTEER
      ]),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { body } = request;

      try {
        const physician = await fastify.prisma.physician.findUnique({
          where: { id }
        });
        if (!physician) throw new Error('Physician not found');

        const updatedPhysician = await fastify.prisma.physician.update({
          where: { id },
          data: body,
        });

        return reply.code(StatusCodes.OK).send(updatedPhysician);
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Physician with ID ${id} does not exist in database.`,
        });
      }
    }
  );
}
