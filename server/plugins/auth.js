import fp from 'fastify-plugin';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const auth = fp(async (fastify, options) => {

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    cookieName: 'sessionId',
    secret: 'a secret with minimum length of 32 characters',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false
    }
  });

  fastify.addHook('preHandler', async (request, reply) => {
    if (!request.session.authenticated) {
      request.session.
      reply.redirect('/login')
    }
  });
});

export default auth;
