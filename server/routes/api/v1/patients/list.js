import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            patient: { type: 'string' },
            physicianId: { type: 'string' },
            hospitalId: { type: 'string' }
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                middleName: { type: 'string' },
                lastName: { type: 'string' },
                dateOfBirth: { type: 'string' },
                gender: { type: 'string' },
                language: { type: 'string' },
                createdBy: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    middleName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                updatedBy: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    middleName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', patient = '', physicianId, hospitalId } = request.query;

      const whereClause = {};

      // Check if patient parameter looks like a partial or complete UUID
      // This regex checks if the patient string contains only hex digits and dashes (UUID format)
      const isPartialUUID = /^[0-9a-f-]+$/i.test(patient.trim());

      if (patient.trim()) {
        if (isPartialUUID) {
          // Calculate offset and limit for pagination
          // offset: how many records to skip (e.g., page 2 with 25 per page skips 25 records)
          // limit: how many records to return per page
          const offset = (parseInt(page) - 1) * parseInt(perPage);
          const limit = parseInt(perPage);

          // Prepare the value for ILIKE search (partial UUID match)
          const likeValue = patient.trim() + '%';

          // Use Prisma's tagged template syntax for raw SQL queries
          const [records, totalResult] = await Promise.all([
            fastify.prisma.$queryRaw`
              SELECT
                p.*,
                to_jsonb(cb) AS "createdBy",
                to_jsonb(ub) AS "updatedBy"
              FROM "Patient" p
              LEFT JOIN "User" cb ON p."createdById" = cb.id
              LEFT JOIN "User" ub ON p."updatedById" = ub.id
              WHERE p."id"::TEXT ILIKE ${likeValue}
              ORDER BY p."updatedAt" DESC
              LIMIT ${limit} OFFSET ${offset}
            `,
            fastify.prisma.$queryRaw`
              SELECT COUNT(*) as total FROM "Patient"
              WHERE "id"::TEXT ILIKE ${likeValue}
            `
          ]);

          // Parse the total count from the result
          const total = parseInt(totalResult[0].total);

          // Set pagination headers in the response and send the records
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
