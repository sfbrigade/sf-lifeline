import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fasitfySession from '@fastify/session'
import fasitfyCsrf from '@fastify/csrf-protection';


const isProduction = process.env.NODE_ENV === "production";
const secret = process.env.SESSION_SECRET;

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function (fastify, opts) {

  //register csrf protection to perform csrf protection logic
  fastify.register(fastifyCookie)
  fastify.register(fasitfySession, {
    secret,
    cookie:{
      maxAge: 1800000,
      secure: isProduction,
      sameSite: isProduction && "Lax",
    }
  });
  fastify.register(fasitfyCsrf, {
    sessionPlugin: '@fastify/session',
  });
});
