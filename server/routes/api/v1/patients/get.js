import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Patient } from '#models/patient.js';
import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid patient ID format'),
        }),
        response: {
          [StatusCodes.OK]: Patient.ResponseSchema,
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([
        Role.ADMIN,
        Role.STAFF,
        Role.VOLUNTEER,
        Role.FIRST_RESPONDER,
      ]),
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const patient = await fastify.prisma.patient.findUnique({
          where: { id },
          include: {
            emergencyContact: true,
            allergies: {
              select: { allergy: true },
              orderBy: { sortOrder: 'asc' },
            },
            medications: {
              select: { medication: true },
              orderBy: { sortOrder: 'asc' },
            },
            conditions: {
              select: { condition: true },
              orderBy: { sortOrder: 'asc' },
            },
            hospital: true,
            physician: {
              include: {
                hospitals: true,
              },
            },
          },
        });
        if (!patient) throw new Error('Patient not found');

        patient.dateOfBirth = patient.dateOfBirth?.toISOString().split('T')[0];

        return reply.code(StatusCodes.OK).send(patient);
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Patient with ID ${id} does not exist in database.`,
        });
      }
    }
  );
}
