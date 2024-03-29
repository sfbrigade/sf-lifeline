import fp from 'fastify-plugin';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function (fastify, _opts) {
  // set up secure encrypted cookie-based sessions
  await fastify.register(import('@fastify/secure-session'), {
    key: Buffer.from(process.env.SESSION_SECRET_KEY, 'hex'),
    cookie: {
      httpOnly: true,
      sameSite: true,
      secure: true,
    },
  });
  // add a user object reference to the request instance
  fastify.decorateRequest('user', null);
  // add a hook to check for a signed in user on every request
  fastify.addHook('onRequest', async (request, _reply) => {
    // first check cookie-based session
    const id = request.session.get('userId');
    if (id) {
      const user = await fastify.prisma.user.findUnique({ where: { id } });
      if (user) {
        request.user = user;
      } else {
        // session data is invalid, delete
        request.session.delete();
      }
    }
  });
  // onRequest handler to be used to ensure a user is logged in
  fastify.decorate('requireUser', async (request, reply) => {
    if (!request.user) {
      reply.unauthorized();
    }
  });
});
