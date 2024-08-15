import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['firstName', 'lastName', 'dateOfBirth'],
          properties: {
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
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
              dateOfBirth: { type: 'string', format: 'date' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { firstName, middleName, lastName, dateOfBirth } = request.body;

      const userId = request.user.id;

      const newPatient = await fastify.prisma.$transaction(async (tx) => {
        let patient = await tx.patient.create({
          data: {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            dateOfBirth: new Date(dateOfBirth),
            createdById: userId,
            updatedById: userId,
          },
        });

        return patient;
      });

      reply.code(StatusCodes.CREATED).send(newPatient);
    },
  );
}
