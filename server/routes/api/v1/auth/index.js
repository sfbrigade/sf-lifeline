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
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'null',
            description:
              'Successfully authenticated. The response sets a cookie named `session` that should be sent in subsequent requests for authentication. This cookie will NOT appear in the web-based API tester infterface because it is an HttpOnly cookie that cannot be accessed by JavaScript.',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      let user = await fastify.prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.notFound();
      }
      user = new User(user);
      const result = await user.comparePassword(password);
      if (!result) {
        return reply.unauthorized();
      }
      if (!user.isActive) {
        return reply.forbidden();
      }
      request.session.set('userId', user.id);
    },
  );

  // add a logout route
  fastify.get('/logout', (request, reply) => {
    request.session.delete();
    reply.send();
  });
}
