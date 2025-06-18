import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify, _opts) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            perPage: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['unapproved', 'approved', 'rejected', 'disabled'],
            },
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
                email: { type: 'string', format: 'email' },
                emailVerifiedAt: { type: 'string' },
                licenseNumber: { type: 'string' },
                licenseData: { type: 'object' },
                role: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                approvedAt: { type: 'string' },
                approvedById: { type: 'string' },
                rejectedAt: { type: 'string' },
                rejectedById: { type: 'string' },
                disabledAt: { type: 'string' },
                disabledById: { type: 'string' },
              },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', search, status } = request.query;
      const options = {
        page,
        perPage,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
          { middleName: 'asc' },
          { email: 'asc' },
        ],
        where: {}
      };
      if (search) {
        options.where.OR = [
          { lastName: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { middleName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      switch (status) {
        case 'unapproved':
          options.where.approvedAt = null;
          options.where.rejectedAt = null;
          break;
        case 'approved':
          options.where.approvedAt = { not: null };
          break;
        case 'rejected':
          options.where.rejectedAt = { not: null };
          break;
        case 'disabled':
          options.where.disabledAt = { not: null };
          break;
      }
      const { records, total } = await fastify.prisma.user.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
