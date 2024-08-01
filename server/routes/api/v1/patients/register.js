import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            patientData: {
              type: 'object',
              required: ['firstName', 'lastName', 'dateOfBirth'],
              properties: {
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string' },
              },
            },
            contactData: {
              type: 'object',
              required: ['firstName', 'lastName', 'phone', 'relationship'],
              properties: {
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' },
              },
            },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { patientData, contactData } = request.body;

      const userId = request.user.id;

      const newPatient = await fastify.prisma.$transaction(async (tx) => {
        let patient = await tx.patient.create({
          data: {
            firstName: patientData.firstName,
            middleName: patientData.middleName,
            lastName: patientData.lastName,
            dateOfBirth: patientData.dateOfBirth,
            createdById: userId,
            updatedById: userId,
          },
        });

        let contact = await tx.contact.create({
          data: {
            firstName: contactData.firstName,
            middleName: contactData.middleName,
            lastName: contactData.lastName,
            phone: contactData.phone,
            relationship: contactData.relationship,
          },
        });

        await tx.patient.update({
          where: {
            id: patient.id,
          },
          data: {
            emergencyContactId: contact.id,
          },
        });
        return patient.id;
      });

      reply.code(StatusCodes.CREATED).send(newPatient);
    },
  );
}
