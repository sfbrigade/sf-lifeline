import { Role } from '../../../../models/user.js';
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
      const { page = '1', perPage = '25', patient = '' } = request.query;

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

      const options = {
        page,
        perPage,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        where: whereClause,
        include: {
          createdBy: true,
          updatedBy: true,
        },
      };

      const { records, total } = await fastify.prisma.patient.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    },
  );
}
