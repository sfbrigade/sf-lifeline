import { StatusCodes } from 'http-status-codes';
import verifyLicense from '../../../../helpers/license/verifyLicense.js';

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            license: { type: 'string' },
          },
        },
      },
    },
    async function (request, reply) {
      const { license } = request.query;
      const results = await verifyLicense(license);

      const user = await fastify.prisma.user.findUnique({
        where: { licenseNumber: license },
      });

      if (user != null) {
        reply
          .code(StatusCodes.UNPROCESSABLE_ENTITY)
          .send({ message: 'License already registered' });
      }

      return results;
    }
  );
}
