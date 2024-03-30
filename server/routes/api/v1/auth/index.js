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
