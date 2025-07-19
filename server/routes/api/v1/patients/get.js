import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const EmergencyContactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  relationship: z.string().nullable(),
});

const HospitalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
});

const PhysicianSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  npi: z.string().nullable(),
});

const PatientResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  gender: z.enum(['FEMALE', 'MALE', 'TRANS_MALE', 'TRANS_FEMALE', 'OTHER', 'UNKNOWN']),
  language: z.enum(['CANTONESE', 'ENGLISH', 'MANDARIN', 'RUSSIAN', 'SPANISH', 'TAGALOG']),
  dateOfBirth: z.coerce.string().date().nullable(),
  codeStatus: z.string().nullable(),
  emergencyContact: EmergencyContactSchema.nullable(),
  allergies: z.array(z.any()),
  conditions: z.array(z.any()),
  medications: z.array(z.any()),
  hospital: HospitalSchema.nullable(),
  physician: PhysicianSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid('Invalid patient ID format'),
        }),
        response: {
          [StatusCodes.OK]: PatientResponseSchema,
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
