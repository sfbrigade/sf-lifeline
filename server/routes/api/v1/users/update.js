import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import User from '#models/user.js';
import verifyLicense from '#helpers/license/verifyLicense.js';

export default async function (fastify, _opts) {
  fastify.patch(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: User.UpdateSchema,
        response: {
          [StatusCodes.OK]: User.ResponseSchema,
        },
      },
      onRequest: fastify.requireUser(),
    },
    async (request, reply) => {
      const { id } = request.params;
      const { firstName, middleName, lastName, email, password, role, licenseNumber, patientNotification } = request.body;

      const errorList = [];

      // Validate request body
      try {
        User.UpdateSchema.parse(request.body);
      } catch (error) {
        error.errors.forEach((e) =>
          errorList.push({ path: e.path[0], message: e.message })
        );
      }

      // Check if user is updating their own account or is an admin
      const currentUser = request.user;
      const isOwnAccount = currentUser.id === id;
      const isAdmin = currentUser.role === User.Role.ADMIN;

      if (!isAdmin && !isOwnAccount) {
        return reply.code(StatusCodes.FORBIDDEN).send({
          error: 'Forbidden',
          message: 'You can only update your own account',
        });
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
        patientNotification,
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
