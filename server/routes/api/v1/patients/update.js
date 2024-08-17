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
            patientData: {
              type: 'object',
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
                codeStatus: {
                  type: 'string',
                  enum: ['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL'],
                },
                dateOfBirth: { type: 'string', format: 'date' },
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
            medicalData: {
              type: 'object',
              properties: {
                allergies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string' },
                    },
                  },
                },
                medications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string' },
                    },
                  },
                },
                conditions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string' },
                    },
                  },
                },
              },
            },
            healthcareChoices: {
              type: 'object',
              required: ['hospitalId', 'physicianId'],
              properties: {
                hospitalId: { type: 'string' },
                physicianId: { type: 'string' },
              },
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
                },
              },
              advancedDirective: { type: 'string' },
              updatedById: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { patientId } = request.params;
      const { patientData, contactData, medicalData, healthcareChoices } =
        request.body;

      const userId = request.user.id;

      const updatedPatient = await fastify.prisma.$transaction(async (tx) => {
        if (patientData) {
          const newPatientData = {};

          // Only update the patient data if the value is truthy
          for (const [key, value] of Object.entries(patientData)) {
            if (value) newPatientData[key] = value;
            if (key === 'dateOfBirth') newPatientData[key] = new Date(value);
          }

          await tx.patient.update({
            where: {
              id: patientId,
            },
            data: newPatientData,
          });
        }
        if (contactData) {
          const { firstName, middleName, lastName, phone, relationship } =
            contactData;

          let contact = await tx.contact.create({
            data: {
              firstName,
              middleName,
              lastName,
              phone,
              relationship,
            },
          });
          await tx.patient.update({
            where: {
              id: patientId,
            },
            data: {
              emergencyContact: {
                connect: { id: contact.id },
              },
              updatedBy: {
                connect: { id: userId },
              },
            },
          });
        }

        if (medicalData) {
          const medicalUpdates = {};

          // Only update the medical data if the value is truthy
          for (const [key, value] of Object.entries(medicalData)) {
            if (value)
              medicalUpdates[key] = {
                set: [],
                connect: value.map(({ id }) => ({ id })),
              };
          }

          if (Object.keys(medicalUpdates).length > 0) {
            await tx.patient.update({
              where: { id: patientId },
              data: {
                ...medicalUpdates,
                updatedBy: { connect: { id: userId } },
              },
            });
          }
        }

        if (healthcareChoices) {
          await tx.patient.update({
            where: {
              id: patientId,
            },
            data: {
              hospital: {
                connect: { id: healthcareChoices.hospitalId },
              },
              physician: {
                connect: { id: healthcareChoices.physicianId },
              },
              updatedBy: {
                connect: { id: userId },
              },
            },
          });
        }

        return tx.patient.findUnique({
          where: { id: patientId },
          include: {
            emergencyContact: true,
            allergies: true,
            medications: true,
            conditions: true,
            hospital: true,
            physician: true,
          },
        });
      });

      reply.code(StatusCodes.OK).send(updatedPatient);
    },
  );
}
