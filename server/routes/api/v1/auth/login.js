import { StatusCodes } from 'http-status-codes';
import User from '../../../../models/user.js';

export default async function (fastify, _opts) {
  // add a login route that handles the actual login
  fastify.post(
    '/login',
    {
      // schema template for fastify-swagger
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          [StatusCodes.OK]: {
            description:
              'Successfully authenticated. The response sets a cookie named `session` that should be sent in subsequent requests for authentication. This cookie will NOT appear in the web-based API tester infterface because it is an HttpOnly cookie that cannot be accessed by JavaScript.',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                },
              },
            },
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              middleName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              emailVerifiedAt: { type: 'string' },
              licenseNumber: { type: 'string' },
              licenseData: { type: 'object' },
              role: { type: 'string' },
              approvedAt: { type: 'string' },
              approvedById: { type: 'string' },
              rejectedAt: { type: 'string' },
              rejectedById: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const data = await fastify.prisma.user.findUnique({ where: { email } });
      if (!data) {
        return reply.notFound();
      }
      const user = new User(data);
      const result = await user.comparePassword(password);
      if (!result) {
        return reply.unauthorized();
      }
      if (!user.isEmailVerified) {
        return reply.status(StatusCodes.FORBIDDEN).send({
          message:
            'Your account has not been verified. Please check your inbox to verify your account.',
        });
      }
      if (user.isRejected || user.isDisabled) {
        return reply.status(StatusCodes.FORBIDDEN).send({
          message:
            'Your account has been rejected or disabled by admins. Please contact support for further instructions.',
        });
      }
      if (user.isUnapproved) {
        return reply.status(StatusCodes.FORBIDDEN).send({
          message:
            'Your account has not been approved by admins yet. Please contact support or wait for further instructions.',
        });
      }

      request.session.set('userId', user.id);
      reply.send(data);
    }
  );
}
