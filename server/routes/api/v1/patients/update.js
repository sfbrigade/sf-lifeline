import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.patch(
    '/update/:patientId',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
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
            medicalData: {
              type: 'object',
              // required: ['allergies', 'medications', 'conditions'],
              properties: {
                allergies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      system: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
                medications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      system: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
                conditions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      category: { type: 'string' },
                      system: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
              },
            },
            healthcareChoices: {
              type: 'object',
              required: ['hospital', 'pcp', 'pcpContact'],
              properties: {
                hospital: { type: 'string' },
                pcp: { type: 'string' },
                pcpContact: { type: 'string' },
              },
            },
          },
        },
        response: {
          [StatusCodes.OK]: {
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
      const { patientId } = request.params;
      const { contactData, medicalData, healthcareChoices } = request.body;

      const userId = request.user.id;

      const updatedPatient = await fastify.prisma.$transaction(async (tx) => {
        if (contactData) {
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
              id: patientId,
            },
            data: {
              emergencyContactId: contact.id,
              updatedById: userId,
            },
          });
        }

        if (medicalData) {
          const { allergies, medications, conditions } = medicalData;

          if (allergies) {
            console.log('allergies', allergies);
          }

          if (medications) {
            console.log('medications', medications);
          }

          if (conditions) {
            console.log('conditions', conditions);
          }

          if (healthcareChoices) {
            console.log('healthcareChoices', healthcareChoices);
          }
        }

        return patientId;
      });

      reply.code(StatusCodes.OK).send(updatedPatient);
    },
  );
}
