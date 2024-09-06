import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: [
            'id',
            'firstName',
            'lastName',
            'gender',
            'language',
            'dateOfBirth',
          ],
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
      const { id, firstName, lastName, gender, language, dateOfBirth } =
        request.body;

      let middleName = request.body.middleName;
      if (middleName) {
        middleName = middleName.trim();
        if (middleName.length === 0) middleName = null;
      }

      const userId = request.user.id;

      const newPatient = await fastify.prisma.$transaction(async (tx) => {
        // Check if the patient already exists
        const exists = await tx.patient.findUnique({
          where: { id },
        });
        if (exists)
          throw reply.status(StatusCodes.CONFLICT).send({
            message: `Patient with ID ${id} already exists in database.`,
          });

        let patient = await tx.patient.create({
          data: {
            id,
            firstName: firstName.trim(),
            middleName,
            lastName: lastName.trim(),
            gender,
            language,
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
