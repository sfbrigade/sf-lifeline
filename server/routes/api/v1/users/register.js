import { StatusCodes } from 'http-status-codes';

import User from '../../../../models/user.js';
import Invite from '../../../../models/invite.js';
import verifyLicense from '../../../../helpers/license/verifyLicense.js';
import userSchema from '../../../../schemas/userSchema.js';

export default async function (fastify, _opts) {
  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string' },
            middleName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            licenseNumber: { type: 'string' },
            inviteId: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.CREATED]: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        firstName,
        middleName,
        lastName,
        email,
        password,
        licenseNumber,
        inviteId,
      } = request.body;

      const errorList = new Array();

      // Validate request body
      try {
        const parsedBody = userSchema.parse(request.body);
      } catch (error) {
        const parseErrors = JSON.parse(error.message);
        parseErrors.forEach((e) =>
          errorList.push({ path: e.path[0], message: e.message }),
        );
      }

      // Check email is not duplicated
      const userFromEmail = await fastify.prisma.user.findUnique({
        where: { email: email },
      });

      if (userFromEmail) {
        errorList.push({
          path: 'email',
          message: 'Email already registered',
        });
      }

      // Validate Invite Id
      let invite;
      if (inviteId) {
        try {
          const inviteData = await fastify.prisma.invite.findUnique({
            where: { id: inviteId },
          });
          if (!inviteData) {
            throw new Error();
          }
          invite = new Invite(inviteData);
          if (!invite.isValid) {
            throw new Error();
          }
        } catch (error) {
          errorList.push({
            path: 'inviteId',
            message: 'Invite Id is not valid',
          });
        }
      }

      let licenseData;

      // Validate License Numbers
      try {
        const licenseResponse = await verifyLicense(licenseNumber);
        if (licenseResponse && licenseResponse.status != 'Expired') {
          const userFromLicense = await fastify.prisma.user.findUnique({
            where: { licenseNumber: licenseNumber },
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

      if (errorList.length) {
        return reply.code(StatusCodes.UNPROCESSABLE_ENTITY).send({
          error: 'Unprocessable Entity',
          message: errorList,
        });
      }

      let data = {
        firstName,
        middleName,
        lastName,
        email,
        licenseNumber,
        licenseData,
      };
      const user = new User(data);

      // Hash the password
      await user.setPassword(password);
      if (invite) {
        user.role = invite.role;
        user.approvedById = invite.invitedById;
        user.approvedAt = invite.createdAt;
      } else {
        // Set role
        user.role = 'FIRST_RESPONDER';
        // Generate verification token and send
        user.generateEmailVerificationToken();
        await user.sendVerificationEmail();
      }
      // Create user in db
      await fastify.prisma.$transaction(async (tx) => {
        data = await tx.user.create({ data });
        if (invite) {
          await tx.invite.update({
            where: { id: invite.id },
            data: {
              acceptedById: data.id,
              acceptedAt: new Date().toISOString(),
            },
          });
        }
      });
      reply.code(StatusCodes.CREATED).send(data);
    },
  );
}
