import bcrypt from 'bcrypt';

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
      try {
        const user = await fastify.prisma.user.findUnique({ where: { email } });
        if (!user) {
          return reply.notFound();
        }
        const result = await bcrypt.compare(password, user.password);
        if (!result) {
          return reply.unauthorized();
        }
        request.session.set('userId', user.id);
      } catch (error) {
        return error;
      }
    },
  );

  // add a logout route
  fastify.get('/logout', (request, reply) => {
    request.session.delete();
    reply.send();
  });
}
