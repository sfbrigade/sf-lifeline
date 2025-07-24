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

      const uuidSearch = process.env.VITE_FEATURE_COLLECT_PHI === 'false';

      if (uuidSearch) {
        const { records, total } = await fastify.prisma.patient.uuidSearch(patient, page, perPage);
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

      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
