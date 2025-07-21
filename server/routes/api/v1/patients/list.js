import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { Patient } from '#models/patient.js';
import { Role } from '#models/user.js';

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
          [StatusCodes.OK]: z.array(Patient.ResponseSchema),
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
      records.forEach((record) => {
        record.dateOfBirth = record.dateOfBirth?.toISOString().split('T')[0];
      });
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
