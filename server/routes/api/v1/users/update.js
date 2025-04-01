import { StatusCodes } from 'http-status-codes';

import User from '../../../../models/user.js';
import verifyLicense from '../../../../helpers/license/verifyLicense.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            role: { type: 'string' },
            licenseNumber: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              licenseNumber: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              approvedAt: { type: 'string' },
              approvedById: { type: 'string' },
            },
          },
        },
      },
      onRequest: fastify.requireUser([User.Role.ADMIN]),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { firstName, middleName, lastName, email, password, role, licenseNumber } = request.body;

      const errorList = [];

      // Validate request body
      try {
        User.UpdateSchema.parse(request.body);
      } catch (error) {
        error.errors.forEach((e) =>
          errorList.push({ path: e.path[0], message: e.message })
        );
      }

      // Check email is not duplicated
      const userFromEmail = await fastify.prisma.user.findUnique({
        where: {
          NOT: {
            id
          },
          email
        },
      });

      if (userFromEmail) {
        errorList.push({
          path: 'email',
          message: 'Email already registered',
        });
      }

      let licenseData;

      // Validate License Numbers
      if (licenseNumber) {
        try {
          const licenseResponse = await verifyLicense(licenseNumber);
          if (licenseResponse && licenseResponse.status !== 'Expired') {
            const userFromLicense = await fastify.prisma.user.findUnique({
              where: { licenseNumber },
            });

            if (userFromLicense) {
              throw new Error('License already registered');
            }

            licenseData = licenseResponse;
          } else {
            throw new Error('Expired or unprocessable license data');
          }
        } catch (error) {
          errorList.push({
            path: 'licenseNumber',
            message: error.message,
          });
        }
      }

      if (errorList.length) {
        return reply.code(StatusCodes.UNPROCESSABLE_ENTITY).send({
          error: 'Unprocessable Entity',
          message: errorList,
        });
      }

      const data = {
        firstName,
        middleName,
        lastName,
        email,
        role,
        licenseNumber: licenseNumber || null,
        licenseData,
      };
      const user = new User(data);

      if (password) {
        await user.setPassword(password);
      }

      const newData = await fastify.prisma.user.update({
        where: { id },
        data,
      });

      reply.send(newData);
    }
  );
}
