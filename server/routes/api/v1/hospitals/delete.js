import { Role } from '../../../../models/user.js';
import { StatusCodes } from 'http-status-codes';

export default async function (fastify) {
  fastify.delete(
    '/:id',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF]),
    },
    async (request, reply) => {
      const id = request.params.id;
      const record = await fastify.prisma.hospital.findUnique({
        where: { id },
        include: {
          patients: true,
          physicians: true
        }
      });
      if (!record) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: 'Hospital not found' });
      }
      if (record.patients.length > 0) {
        return reply.status(StatusCodes.BAD_REQUEST).send({ message: 'Cannot delete hospital with patients' });
      }
      if (record.physicians.length > 0) {
        return reply.status(StatusCodes.BAD_REQUEST).send({ message: 'Cannot delete hospital with physicians' });
      }
      await fastify.prisma.hospital.delete({
        where: { id },
      });
      if (!record) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Failed to delete hospital' });
      }
      reply.send({ message: 'Hospital deleted successfully' });
    }
  );
}
