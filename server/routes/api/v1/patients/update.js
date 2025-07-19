import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const GenderEnum = z.enum(['FEMALE', 'MALE', 'TRANS_MALE', 'TRANS_FEMALE', 'OTHER', 'UNKNOWN']);
const LanguageEnum = z.enum(['CANTONESE', 'ENGLISH', 'MANDARIN', 'RUSSIAN', 'SPANISH', 'TAGALOG']);
const RelationshipEnum = z.enum(['SPOUSE', 'PARENT', 'CHILD', 'SIBLING', 'OTHER', 'UNKNOWN']).nullable();
const CodeStatusEnum = z.enum(['COMFORT', 'DNR', 'DNI', 'DNR_DNI', 'FULL']).nullable();

const PatientDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  gender: GenderEnum.optional(),
  language: LanguageEnum.optional(),
  dateOfBirth: z.union([z.string().date('Invalid date format'), z.literal('')])
    .transform(val => val || null)
    .optional(),
  codeStatus: CodeStatusEnum.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one patient field must be provided',
  path: ['patientData']
});

const ContactDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').or(z.literal('')).optional(),
  phone: z.string()
    .regex(/^(\([0-9]{3}\) [0-9]{3}-[0-9]{4})?$/, 'Phone must be in format (###) ###-####')
    .optional(),
  relationship: RelationshipEnum.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one contact field must be provided',
  path: ['contactData']
});

const MedicalDataSchema = z.object({
  allergies: z.array(z.string().uuid('Invalid allergy ID format')).optional(),
  medications: z.array(z.string().uuid('Invalid medication ID format')).optional(),
  conditions: z.array(z.string().uuid('Invalid condition ID format')).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one medical field must be provided',
  path: ['medicalData']
});

const HealthcareChoicesSchema = z.object({
  hospitalId: z.union([z.string().uuid('Invalid hospital ID format'), z.literal('')]).optional(),
  physicianId: z.union([z.string().uuid('Invalid physician ID format'), z.literal('')]).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one healthcare choice field must be provided',
  path: ['healthcareChoices']
});

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          patientData: PatientDataSchema.optional(),
          contactData: ContactDataSchema.optional(),
          medicalData: MedicalDataSchema.optional(),
          healthcareChoices: HealthcareChoicesSchema.optional(),
          codeStatus: CodeStatusEnum.optional(),
        }).refine(data =>
          data.patientData ||
          data.contactData ||
          data.medicalData ||
          data.healthcareChoices ||
          data.codeStatus !== undefined,
        {
          message: 'At least one field must be provided for update',
          path: ['body']
        }
        ),
        response: {
          [StatusCodes.OK]: z.object({
            id: z.string().uuid(),
            firstName: z.string().nullable(),
            middleName: z.string().nullable(),
            lastName: z.string().nullable(),
            gender: z.string(),
            language: z.string(),
            dateOfBirth: z.coerce.string().date().nullable(),
            codeStatus: z.string().nullable(),
            emergencyContact: z.object({
              id: z.string().uuid(),
              firstName: z.string(),
              middleName: z.string().nullable(),
              lastName: z.string(),
              email: z.string().email().nullable(),
              phone: z.string().nullable(),
              relationship: z.string(),
            }).nullable(),
            allergies: z.array(z.object({
              allergy: z.object({
                id: z.string().uuid()
              })
            })),
            conditions: z.array(z.object({
              condition: z.object({
                id: z.string().uuid()
              })
            })),
            medications: z.array(z.object({
              medication: z.object({
                id: z.string().uuid()
              })
            })),
            hospital: z.object({
              id: z.string().uuid(),
              name: z.string(),
              address: z.string(),
              phone: z.string(),
              email: z.string(),
            }).nullable(),
            physician: z.object({
              id: z.string().uuid(),
              firstName: z.string(),
              middleName: z.string().nullable(),
              lastName: z.string(),
              phone: z.string(),
              email: z.string(),
            }).nullable(),
            updatedById: z.string(),
          }),
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

      updatedPatient.dateOfBirth = updatedPatient.dateOfBirth?.toISOString().split('T')[0];

      return reply.code(StatusCodes.OK).send(updatedPatient);
    }
  );
}
