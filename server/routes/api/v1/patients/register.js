import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const GenderEnum = z.enum([
  'FEMALE',
  'MALE',
  'TRANS_MALE',
  'TRANS_FEMALE',
  'OTHER',
  'UNKNOWN',
]);

const LanguageEnum = z.enum([
  'CANTONESE',
  'ENGLISH',
  'MANDARIN',
  'RUSSIAN',
  'SPANISH',
  'TAGALOG',
]);

export default async function (fastify, _opts) {
  const basePatientSchema = z.object({
    id: z.string().uuid('Invalid patient ID format'),
    firstName: z.string().min(1, 'First name is required').nullable(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().min(1, 'Last name is required').nullable(),
    gender: GenderEnum,
    language: LanguageEnum,
    dateOfBirth: z.string().date('Invalid date format'),
  });

  const patientSchema = process.env.VITE_FEATURE_COLLECT_PHI
    ? basePatientSchema
    : basePatientSchema.partial();

  fastify.post(
    '/',
    {
      schema: {
        body: patientSchema,
        response: {
          [StatusCodes.CREATED]: z.object({
            id: z.string().uuid(),
            firstName: z.string().nullable(),
            middleName: z.string().nullable(),
            lastName: z.string().nullable(),
            gender: GenderEnum,
            language: LanguageEnum,
            dateOfBirth: z.coerce.string().date().nullable(),
            createdAt: z.coerce.date(),
            updatedAt: z.coerce.date(),
          }),
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
