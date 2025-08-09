import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import verifyLicense from '#helpers/license/verifyLicense.js';

const LicenseResponseSchema = z.object({
  name: z.string(),
  licenseType: z.string(),
  status: z.string(),
  licenseNumber: z.string(),
});

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          license: z.string().min(1, 'License number is required'),
        }),
        response: {
          [StatusCodes.OK]: LicenseResponseSchema,
          [StatusCodes.UNPROCESSABLE_ENTITY]: z.object({
            message: z.string(),
          }),
          [StatusCodes.NOT_FOUND]: z.object({
            message: z.string(),
          }),
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
