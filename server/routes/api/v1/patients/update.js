import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
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
                phone: {
                  type: 'string',
                  anyOf: [
                    { pattern: '^(\\([0-9]{3}\\))-[0-9]{3}-[0-9]{4}$' },
                    { pattern: '^$' },
                  ],
                },
                relationship: { type: 'string' },
              },
            },
            medicalData: {
              type: 'object',
              properties: {
                allergies: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uuid',
                  },
                },
                medications: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uuid',
                  },
                },
                conditions: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uuid',
                  },
                },
              },
            },
            healthcareChoices: {
              type: 'object',
              required: ['hospitalId', 'physicianId'],
              properties: {
                hospitalId: { type: 'string', format: 'uuid' },
                physicianId: { type: 'string', format: 'uuid' },
              },
            },
            codeStatus: {
              type: 'string',
              enum: ['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL'],
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
      const { id } = request.params;
      const {
        patientData,
        contactData,
        medicalData,
        healthcareChoices,
        codeStatus,
      } = request.body;

      const userId = request.user.id;

      try {
        const patient = await fastify.prisma.patient.findUnique({
          where: { id },
        });
        if (!patient) {
          throw new Error('Patient not found');
        }
      } catch (error) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: `Patient with ID ${id} does not exist in database.`,
        });
      }

      const updatedPatient = await fastify.prisma.$transaction(async (tx) => {
        if (patientData) {
          const newPatientData = {};

          // Only update the patient data if the value is truthy
          for (const [key, value] of Object.entries(patientData)) {
            if (value) newPatientData[key] = value.trim();
            if (key === 'dateOfBirth') newPatientData[key] = new Date(value);
          }

          await tx.patient.update({
            where: { id },
            data: newPatientData,
          });
        }
        if (contactData) {
          const { firstName, lastName, relationship } = contactData;

          let phone = contactData.phone.length === 0 ? null : contactData.phone;

          let middleName = contactData.middleName;
          if (middleName) {
            middleName = middleName.trim();
            if (middleName.length === 0) middleName = null;
          }

          let contact = await tx.contact.create({
            data: {
              firstName: firstName.trim(),
              middleName,
              lastName: lastName.trim(),
              phone,
              relationship,
            },
          });
          await tx.patient.update({
            where: { id },
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
          const RELATION_KEYS = {
            allergies: 'allergy',
            medications: 'medication',
            conditions: 'condition',
          };

          const JOIN_MODELS = {
            allergies: 'PatientAllergy',
            medications: 'PatientMedication',
            conditions: 'PatientCondition',
          };

          for (const key of Object.keys(medicalData)) {
            const model = JOIN_MODELS[key];

            // Delete previous connections for the patient
            await tx[model].deleteMany({
              where: {
                patientId: id,
              },
            });
          }

          for (const [key, value] of Object.entries(medicalData)) {
            if (value) {
              const model = JOIN_MODELS[key];
              const relation = RELATION_KEYS[key];

              for (let i = 0; i < value.length; i++) {
                const item = value[i];

                // Check if the referenced record exists
                const exists = await tx[relation].findUnique({
                  where: { id: item },
                });
                if (!exists)
                  // Use throw instead of return to make sure transaction is rolled back
                  throw reply.status(StatusCodes.NOT_FOUND).send({
                    message: `${key} with ID ${item} does not exist in database.`,
                  });

                await tx[model].upsert({
                  where: {
                    [`patientId_${relation}Id`]: {
                      patientId: id,
                      [`${relation}Id`]: item,
                    },
                  },
                  update: { sortOrder: i },

                  create: {
                    patientId: id,
                    [`${relation}Id`]: item, // Use dynamic relation key (allergyId, medicationId, conditionId)
                    sortOrder: i, // Set sort order based on input array index
                  },
                });
              }
            }
          }

          await tx.patient.update({
            where: { id },
            data: {
              updatedBy: { connect: { id: userId } },
            },
          });
        }

        if (healthcareChoices) {
          // Validate hospital and physician IDs
          const hospital = await tx.hospital.findUnique({
            where: { id: healthcareChoices.hospitalId },
          });
          if (!hospital)
            // Use throw instead of return to make sure transaction is rolled back
            throw reply.status(StatusCodes.NOT_FOUND).send({
              message: `Hospital with ID ${healthcareChoices.hospitalId} does not exist in database.`,
            });

          const physician = await tx.physician.findUnique({
            where: { id: healthcareChoices.physicianId },
          });
          if (!physician)
            throw reply.status(StatusCodes.NOT_FOUND).send({
              message: `Physician with ID ${healthcareChoices.physicianId} does not exist in database.`,
            });

          await tx.patient.update({
            where: { id },
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

        if (codeStatus) {
          await tx.patient.update({
            where: { id },
            data: {
              codeStatus,
              updatedBy: {
                connect: { id: userId },
              },
            },
          });
        }

        return tx.patient.findUnique({
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
            physician: true,
          },
        });
      });

      return reply.code(StatusCodes.OK).send(updatedPatient);
    },
  );
}
