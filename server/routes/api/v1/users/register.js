import { StatusCodes } from 'http-status-codes';

import mailer from '../../../../helpers/email/mailer.js';
import User from '../../../../models/user.js';

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
            email: { type: 'string', format: 'email' },
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

      let invite;
      if (inviteId) {
        invite = await fastify.prisma.invite.findUnique({
          where: { id: inviteId },
        });
        if (!invite) {
          return reply.notFound();
        }
        if (
          Date.parse(invite.expiresAt) < Date.now() ||
          !!invite.acceptedAt ||
          !!invite.revokedAt
        ) {
          return reply.gone();
        }
      }

      let data = { firstName, middleName, lastName, email, licenseNumber };
      const user = new User(data);
      // Hash the password
      await user.setPassword(password);
      if (invite) {
        user.role = invite.role;
        user.approvedById = invite.invitedById;
        user.approvedAt = invite.createdAt;
      } else {
        // Generate verification token
        user.generateEmailVerificationToken();
        // Set role
        user.role = 'FIRST_RESPONDER';
        // Format email
        let mailOptions = {
          from: `"SF Lifeline" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'SF Lifeline - Please Verify Your Email',
          html: `
            <p>Hi ${firstName},</p>
            <p>Enter the 6-character code to verify your email.</p>
            <p><b>${user.emailVerificationToken}</b></p>
            <p>Please allow our admins to review and confirm your identity. Thanks for helping us keep your account secure.</p>
            <p>Best,<br/>Sf Lifeline</p>
          `,
        };
        // Send mail
        mailer.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
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
