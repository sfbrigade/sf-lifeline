import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  const phoneRegex = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;

  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().min(1, 'ID is required'),
        }),
        body: z.object({
          name: z.string().min(1, 'Name is required').optional(),
          email: z.string().email('Invalid email address').optional(),
          address: z.string().min(1, 'Address is required').optional(),
          phone: z.string()
            .min(1, 'Phone number is required')
            .regex(phoneRegex, 'Phone number must be in format (###) ###-####')
            .optional(),
        }).refine(data => Object.keys(data).length > 0, {
          message: 'At least one field must be provided for update',
        }),
        response: {
          [StatusCodes.OK]: z.object({
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
      const id = request.params.id;
      const { name, address, phone, email } = request.body;
      const hospital = await fastify.prisma.hospital.findUnique({
        where: { id },
      });
      if (!hospital) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      const updatedHospital = await fastify.prisma.hospital.update({
        where: { id },
        data: {
          name,
          address,
          phone,
          email,
        },
      });
      if (!updatedHospital) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Failed to update hospital' });
      }
      return reply.send(updatedHospital);
    }
  );
}
