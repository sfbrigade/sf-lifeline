import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
      response: {
        [StatusCodes.OK]: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            gender: { type: 'string' },
            language: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            codeStatus: { type: 'string' },
            emergencyContact: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' },
              },
            },
            allergies: { type: 'array' },
            conditions: { type: 'array' },
            medications: { type: 'array' },
            hospital: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                address: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
              },
            },
            physician: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
                hospitals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      address: { type: 'string' },
                      phone: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                },
              },
            },
            updatedById: { type: 'string' },
          },
        },
        [StatusCodes.NOT_FOUND]: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
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

        patient.dateOfBirth = patient.dateOfBirth.toISOString().split('T')[0];

        return reply.code(StatusCodes.OK).send(patient);
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Patient with ID ${id} does not exist in database.`,
        });
      }
    }
  );
}
