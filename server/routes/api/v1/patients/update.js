import { Role } from '#models/user.js';
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
                dateOfBirth: {
                  oneOf: [
                    { type: 'string', format: 'date' },
                    { type: 'string', minLength: 0, maxLength: 0 },
                  ]
                }
              },
            },
            contactData: {
              type: 'object',
              // required: ['firstName', 'lastName', 'relationship'],
              properties: {
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                email: {
                  type: 'string',
                  anyOf: [{ format: 'email' }, { pattern: '^$' }],
                },
                phone: {
                  type: 'string',
                  anyOf: [
                    { pattern: '^(\\([0-9]{3}\\)) [0-9]{3}-[0-9]{4}$' },
                    { pattern: '^$' },
                  ],
                },
                relationship: {
                  type: ['string', 'null'],
                  enum: [
                    'SPOUSE',
                    'PARENT',
                    'CHILD',
                    'SIBLING',
                    'OTHER',
                    'UNKNOWN',
                    null,
                  ],
                },
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
                hospitalId: {
                  type: 'string',
                  anyOf: [{ format: 'uuid' }, { pattern: '^$' }],
                },
                physicianId: {
                  type: 'string',
                  anyOf: [{ format: 'uuid' }, { pattern: '^$' }],
                },
              },
            },
            codeStatus: {
              type: ['string', 'null'],
              enum: ['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL', null],
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
                  email: { type: 'string', format: 'email' },
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
          for (let [key, value] of Object.entries(patientData)) {
            value = value?.trim();
            if (value) {
              newPatientData[key] = value;
            } else {
              newPatientData[key] = null;
            }
            if (key === 'dateOfBirth' && value) {
              newPatientData[key] = new Date(value);
            }
          }

          await tx.patient.update({
            where: { id },
            data: {
              ...newPatientData,
              updatedBy: {
                connect: { id: userId },
              },
            },
          });
        }
        if (contactData) {
          const newContactData = {};

          for (const [key, value] of Object.entries(contactData)) {
            if (value) newContactData[key] = value.trim();
            if (value?.trim()?.length === 0) newContactData[key] = null;
            if (key === 'relationship' && value === null) {
              newContactData[key] = value;
            }
          }

          const nullFields = Object.entries(newContactData).filter(
            ([_, value]) => value === null
          );

          const existingContact = await tx.patient.findUnique({
            where: { id },
            include: {
              emergencyContact: true,
            },
          });

          if (existingContact.emergencyContact) {
            if (nullFields.length !== Object.keys(newContactData).length) {
              await tx.contact.update({
                where: { id: existingContact.emergencyContact.id },
                data: newContactData,
              });
            } else {
              await tx.patient.update({
                where: { id },
                data: {
                  emergencyContact: {
                    disconnect: true,
                  },
                  updatedBy: {
                    connect: { id: userId },
                  },
                },
              });
            }
          } else {
            if (nullFields.length !== Object.keys(newContactData).length) {
              const contact = await tx.contact.create({
                data: newContactData,
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
          }
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
                if (!exists) {
                  // Use throw instead of return to make sure transaction is rolled back
                  throw reply.status(StatusCodes.NOT_FOUND).send({
                    message: `${key} with ID ${item} does not exist in database.`,
                  });
                }

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
          const { hospitalId, physicianId } = healthcareChoices;

          if (hospitalId) {
            const hospital = await tx.hospital.findUnique({
              where: { id: hospitalId },
            });
            if (!hospital) {
              // Use throw instead of return to make sure transaction is rolled back
              throw reply.status(StatusCodes.NOT_FOUND).send({
                message: `Hospital with ID ${hospitalId} does not exist in database.`,
              });
            }
          }

          if (physicianId) {
            const physician = await tx.physician.findUnique({
              where: { id: physicianId },
            });
            if (!physician) {
              throw reply.status(StatusCodes.NOT_FOUND).send({
                message: `Physician with ID ${physicianId} does not exist in database.`,
              });
            }
          }

          const hospitalData = hospitalId
            ? { hospital: { connect: { id: hospitalId } } }
            : { hospital: { disconnect: true } };
          const physicianData = physicianId
            ? { physician: { connect: { id: physicianId } } }
            : { physician: { disconnect: true } };

          await tx.patient.update({
            where: { id },
            data: {
              ...hospitalData,
              ...physicianData,
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
    }
  );
}
