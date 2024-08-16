import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: [
            'firstName',
            'lastName',
            'gender',
            'language',
            'dateOfBirth',
          ],
          properties: {
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
      const { firstName, middleName, lastName, gender, language, dateOfBirth } =
        request.body;

      const userId = request.user.id;

      const newPatient = await fastify.prisma.$transaction(async (tx) => {
        let patient = await tx.patient.create({
          data: {
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            gender: gender,
            language: language,
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
