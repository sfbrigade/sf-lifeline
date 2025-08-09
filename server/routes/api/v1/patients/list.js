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

      const whereClause = {};

      const uuidSearch = process.env.VITE_FEATURE_COLLECT_PHI === 'false';

      if (uuidSearch) {
        const { records, total } = await fastify.prisma.patient.uuidSearch(patient, page, perPage);
        records.forEach((record) => {
          record.dateOfBirth = record.dateOfBirth?.toISOString().split('T')[0];
        });
        reply.setPaginationHeaders(page, perPage, total).send(records);
        return;
      } else {
        // Handle name search (if not a UUID)
        // Split the patient string by spaces to support full name searches
        const splitQuery = patient.trim().split(' ').filter(part => part.length > 0);

        if (splitQuery.length > 1) {
          // Full name search: e.g., "John Smith" - look for first name containing "John" AND last name containing "Smith"
          whereClause.AND = [
            {
              firstName: {
                contains: splitQuery[0],
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: splitQuery[splitQuery.length - 1],
                mode: 'insensitive',
              },
            },
          ];
        } else {
          // Single name search: e.g., "John" or "Smith" - look in both first and last names
          whereClause.OR = [
            { firstName: { contains: patient.trim(), mode: 'insensitive' } },
            { lastName: { contains: patient.trim(), mode: 'insensitive' } },
          ];
        }
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
