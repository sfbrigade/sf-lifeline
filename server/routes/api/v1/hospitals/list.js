import { Role } from '#models/user.js';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().optional().default(1),
          perPage: z.coerce.number().int().positive().optional().default(25),
          hospital: z.string().optional(),
          physicianId: z.string().optional(),
        }),
        response: {
          [StatusCodes.OK]: z.array(z.object({
            id: z.string(),
            name: z.string(),
            address: z.string(),
            phone: z.string(),
            email: z.string().email(),
          })),
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const { page = '1', perPage = '25', hospital, physicianId } = request.query;

      const options = {
        page,
        perPage,
        orderBy: [{ name: 'asc' }],
        where: { },
      };

      if (hospital) {
        options.where.name = { contains: hospital.trim(), mode: 'insensitive' };
      }

      if (physicianId) {
        options.where.physicians = {
          some: {
            id: physicianId,
          },
        };
      }

      const { records, total } =
        await fastify.prisma.hospital.paginate(options);

      reply.setPaginationHeaders(page, perPage, total).send(records);
    }
  );
}
