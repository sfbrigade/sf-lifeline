import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Patient } from '#models/patient.js';
import { Role } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.post(
    '/',
    {
      schema: {
        body: process.env.VITE_FEATURE_COLLECT_PHI
          ? Patient.RegisterSchema.required({
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            language: true,
          })
          : Patient.RegisterSchema,
        response: {
          [StatusCodes.CREATED]: Patient.ResponseSchema,
          [StatusCodes.BAD_REQUEST]: z.object({
            message: z.string(),
          }),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { id } = request.body;

      const userId = request.user.id;
      try {
        const newPatient = await fastify.prisma.$transaction(async (tx) => {
          // Check if the patient already exists
          const exists = await tx.patient.findUnique({
            where: { id },
          });
          if (exists) {
            throw new Error(
              `Patient with ID ${id} already exists in database.`
            );
          }

          const newPatientData = {};

          for (let [key, value] of Object.entries(request.body)) {
            value = value?.trim();
            if (value) {
              newPatientData[key] = value;
            } else {
              newPatientData[key] = null;
            }
            if (key === 'dateOfBirth' && value) {
              newPatientData[key] = new Date(value);
            }
          }

          const patient = await tx.patient.create({
            data: {
              ...newPatientData,
              createdById: userId,
              updatedById: userId,
            },
          });

          return patient;
        });

        newPatient.dateOfBirth = newPatient.dateOfBirth?.toISOString().split('T')[0];

        reply.code(StatusCodes.CREATED).send(newPatient);
      } catch (error) {
        if (error.message.includes('already exists')) {
          return reply.status(StatusCodes.CONFLICT).send({
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
