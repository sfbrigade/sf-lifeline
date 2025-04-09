import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: process.env.VITE_FEATURE_COLLECT_PHI
            ? [
                'id',
                'firstName',
                'lastName',
                'gender',
                'language',
                'dateOfBirth',
              ]
            : [],
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            gender: {
              type: 'string',
              enum: [
                'FEMALE',
                'MALE',
                'TRANS_MALE',
                'TRANS_FEMALE',
                'OTHER',
                'UNKNOWN',
              ],
            },
            language: {
              type: 'string',
              enum: [
                'CANTONESE',
                'ENGLISH',
                'MANDARIN',
                'RUSSIAN',
                'SPANISH',
                'TAGALOG',
              ],
            },
            dateOfBirth: {
              oneOf: [
                { type: 'string', format: 'date' },
                { type: 'string', minLength: 0, maxLength: 0 },
              ]
            }
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
              gender: { type: 'string' },
              language: { type: 'string' },
              dateOfBirth: { type: 'string', format: 'date' },
            },
          },
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

          for (const [key, value] of Object.entries(request.body)) {
            if (value) {
              newPatientData[key] = value.trim();
            } else if (value.trim().length === 0) {
              newPatientData[key] = null;
            } else if (key === 'dateOfBirth') {
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
