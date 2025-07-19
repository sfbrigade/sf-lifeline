import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const UserResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  role: z.string(),
});

const PatientListItemSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  gender: z.enum(['FEMALE', 'MALE', 'TRANS_MALE', 'TRANS_FEMALE', 'OTHER', 'UNKNOWN']),
  language: z.enum(['CANTONESE', 'ENGLISH', 'MANDARIN', 'RUSSIAN', 'SPANISH', 'TAGALOG']),
  createdBy: UserResponseSchema,
  updatedBy: UserResponseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1).optional(),
          perPage: z.coerce.number().int().positive().default(25).optional(),
          patient: z.string().default('').optional(),
          physicianId: z.string().uuid().optional(),
          hospitalId: z.string().uuid().optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(PatientListItemSchema),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', patient = '', physicianId, hospitalId } = request.query;

      const splitQuery = patient.trim().split(' ');

      let whereClause = {};

      if (splitQuery.length > 1) {
        whereClause = {
          AND: [
            {
              OR: [
                {
                  firstName: {
                    contains: splitQuery[0].trim(),
                    mode: 'insensitive',
                  },
                },
                { firstName: null },
              ],
            },
            {
              OR: [
                {
                  lastName: {
                    contains: splitQuery[1].trim(),
                    mode: 'insensitive',
                  },
                },
                { lastName: null },
              ],
            },
          ],
        };
      } else {
        whereClause = {
          OR: [
            { firstName: { contains: patient.trim(), mode: 'insensitive' } },
            { lastName: { contains: patient.trim(), mode: 'insensitive' } },
            {
              AND: [
                {
                  OR: [
                    {
                      firstName: {
                        contains: patient.trim(),
                        mode: 'insensitive',
                      },
                    },
                    { firstName: null },
                  ],
                },
                {
                  OR: [
                    {
                      lastName: {
                        contains: patient.trim(),
                        mode: 'insensitive',
                      },
                    },
                    { lastName: null },
                  ],
                },
              ],
            },
          ],
        };
      }

      if (physicianId) {
        whereClause.physicianId = physicianId;
      }

      if (hospitalId) {
        whereClause.hospitalId = hospitalId;
      }

      const options = {
        page,
        perPage,
        orderBy: [{ updatedAt: 'desc' }],
        where: whereClause,
        include: {
          createdBy: true,
          updatedBy: true,
        },
      };

      const { records, total } = await fastify.prisma.patient.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
