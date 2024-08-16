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
              dateOfBirth: { type: 'string', format: 'date' },
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

          if (patientData.firstName)
            newPatientData.firstName = patientData.firstName;
          if (patientData.middleName)
            newPatientData.middleName = patientData.middleName;
          if (patientData.lastName)
            newPatientData.lastName = patientData.lastName;
          if (patientData.dateOfBirth)
            newPatientData.dateOfBirth = new Date(patientData.dateOfBirth);

          await tx.patient.update({
            where: {
              id: patientId,
            },
            data: newPatientData,
          });
        }
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
          const { allergies, medications, conditions } = medicalData;
          const medicalUpdates = {};

          if (allergies) {
            medicalUpdates.allergies = {
              connect: allergies.map(({ id }) => ({ id })),
            };
          }
          if (medications) {
            medicalUpdates.medications = {
              connect: medications.map(({ id }) => ({ id })),
            };
          }
          if (conditions) {
            medicalUpdates.conditions = {
              connect: conditions.map(({ id }) => ({ id })),
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
