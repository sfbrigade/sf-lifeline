import fp from 'fastify-plugin';

import User, { Role } from '../models/user.js';

export default fp(async function (fastify) {
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
  fastify.addHook('onRequest', async (request) => {
    // first check cookie-based session
    const id = request.session.get('userId');
    if (id) {
      const user = await fastify.prisma.user.findUnique({ where: { id } });
      if (user) {
        request.user = new User(user);
      } else {
        // session data is invalid, delete
        request.session.delete();
      }
    }
  });
  // onRequest handler to be used to ensure a user is logged in
  fastify.decorate('requireUser', (roles) => {
    return async (request, reply) => {
      if (!request.user) {
        reply.unauthorized();
      }
      if (roles.length > 0) {
        if (request.user.role !== Role.ADMIN && !roles.includes(request.user.role)) {
          reply.forbidden();
        }
      }
    };
  });
});
