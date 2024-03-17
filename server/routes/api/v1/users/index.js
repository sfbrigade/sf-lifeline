'use strict';

import crypto from 'crypto';

import mailer from '../../../../helpers/email/mailer.js';

// async function preHandler (request, reply) {
//   const { id } = request.params
//   const user = await fastify.prisma.user.findUnique({
//     where: { id: Number(id) }
//   })

//   if (!user) {
//     reply.code(404).send({
//       code: 'USER_NOT_FOUND',
//       message: `The user #${id} not found!`
//     })
//   } else {
//     reply.send(user)
//   }
// }

// User template for the routes
export default async function (fastify, _opts) {
  //Register a user
  fastify.post(
    '/register',
    {
      // schema template for fastify-swagger
      schema: {
        body: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'role'],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string' },
            hashedPassword: { type: 'string' },
            licenseNumber: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
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
        lastName,
        email,
        role,
        hashedPassword,
        licenseNumber,
      } = request.body;

      const buffer = crypto.randomBytes(3);
      const emailVerificationToken = buffer.toString('hex').toUpperCase();
      const user = await fastify.prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          role,
          hashedPassword,
          licenseNumber,
          emailVerificationToken,
        },
      });

      let mailOptions = {
        from: `"SF Lifeline" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'SF Lifeline - Please Verify Your Email',
        html: `
          <p>Hi ${firstName},</p>
          <p>Enter the 6-character code to verify your email.</p>
          <p><b>${emailVerificationToken}</b></p>
          <p>Please allow our admins to review and confirm your identity. Thanks for helping us keep your account secure.</p>
          <p>Best,<br/>Sf Lifeline</p>
        `,
      };

      mailer.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      reply.code(201).send(user);
    },
  );

  // Read All Users
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const users = await fastify.prisma.user.findMany();
      reply.send(users);
    },
  );

  // Read User by ID
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              hasPassword: { type: 'boolean' },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = await fastify.prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        reply.code(404).send({ message: 'User not found' });
        return;
      }

      reply.send(user);
    },
  );

  // Update User by ID
  fastify.put(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            hasPassword: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              hasPassword: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, email, password, hasPassword } = request.body;

      // Logic to update the user (use hasPassword for updating password)

      const user = await fastify.prisma.user.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          password,
          hasPassword,
        },
      });

      reply.send(user);
    },
  );

  // Delete User by ID
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await fastify.prisma.user.delete({
        where: { id: Number(id) },
      });

      reply.send({ message: 'User deleted successfully' });
    },
  );
}
