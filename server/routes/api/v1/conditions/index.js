import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            category: { type: 'string', nullable: true },
            system: { type: 'string' },
            code: { type: 'string', nullable: true },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string'},
              system: { type: 'string'},
              code: { type: 'string'},
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, system } = request.body;

      if (name.trim().length === 0) {
        reply.code(StatusCodes.BAD_REQUEST).send({ message: 'Name cannot be empty or just spaces.' });
        return;
      }

      const existingCondition = await fastify.prisma.condition.findFirst({
        where: {
          name: name.trim(),
        },
      });

      if (existingCondition) {
        reply.code(StatusCodes.OK).send(existingCondition);
        return;
      }

      const newCondition = await fastify.prisma.condition.create({
        data: {
          name: name.trim(),
          system: system,
        },
      });

      reply.code(StatusCodes.CREATED).send(newCondition);
    }
  );

  fastify.get(
    '',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            perPage: { type: 'integer' },
            condition: { type: 'string' },
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
              name: { type: 'string' },
              category: { type: 'string' },
              system: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', condition } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { name: { contains: condition.trim(), mode: 'insensitive' } },
      };

      const { records, total } =
        await fastify.prisma.condition.paginate(options);
      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
