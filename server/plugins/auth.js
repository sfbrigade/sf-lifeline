import fp from 'fastify-plugin';

import User, { Role } from '../models/user.js';

export default fp(async function (fastify) {
  // set up secure encrypted cookie-based sessions
  await fastify.register(import('@fastify/secure-session'), {
    key: Buffer.from(process.env.SESSION_SECRET_KEY, 'hex'),
    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: true,
      secure: process.env.BASE_URL?.startsWith('https'),
    },
  });
  // add a user object reference to the request instance
  fastify.decorateRequest('user', null);
  // add a hook to check for a signed in user on every request
  fastify.addHook('onRequest', async (request) => {
    // first check cookie-based session
    const id = request.session.get('userId');
    if (id) {
      const data = await fastify.prisma.user.findUnique({ where: { id } });
      if (data) {
        request.user = new User(data);
      } else {
        // session data is invalid, delete
        request.session.delete();
      }
    }
  });
  // onRequest handler to be used to ensure a user is logged in
  fastify.decorate('requireUser', (role) => {
    return async (request, reply) => {
      if (!request.user) {
        return reply.unauthorized();
      }
      if (!request.user.isActive) {
        return reply.forbidden();
      }
      if (role) {
        if (Array.isArray(role)) {
          if (!role.includes(request.user.role)) {
            return reply.forbidden();
          }
        } else if (
          request.user.role !== Role.ADMIN &&
          request.user.role !== role
        ) {
          return reply.forbidden();
        }
      }
    };
  });
});
