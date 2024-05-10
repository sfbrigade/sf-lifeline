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
      } = request.body;

      let data = { firstName, middleName, lastName, email, licenseNumber };
      const user = new User(data);
      // Hash the password
      await user.setPassword(password);
      // Generate verification token
      user.generateEmailVerificationToken();
      // Set role
      user.role = 'FIRST_RESPONDER';

      // Create user in db
      data = await fastify.prisma.user.create({ data });

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

      reply.code(StatusCodes.CREATED).send(data);
    },
  );
}
