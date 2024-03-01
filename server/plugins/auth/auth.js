import fp from 'fastify-plugin';
import fastifyAuth from '@fastify/auth'

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function (fastify, opts) {
  fastify
  .decorate('verifyAdmin', function (request, reply, done) {
    // your validation logic
    done() // pass an error if the authentication fails
  })
  // Local strategy to authenticate users with username and password
  .decorate('localStrategy', async (request, reply, done) => {
    try{
      //findUniqueOrThrow is a method provided by Prisma to return a single record or an error if none found
      const user = fastify.prisma.users.findUniqueOrThrow({
        where: {
          email: request.body.email}
      });
      const isValidPassword = await bcrypt.compare(request.body.password, user.hashedPassword);
      return isValidPassword ? done(null,user) : done(new Error('Password is incorrect'));
    }catch(error){
      done(error);
    }
  })
  .register(fastifyAuth)
  .after(() => {
    fastify.route({
      method: 'POST',
      url: '/auth-multiple',
      preHandler: fastify.auth([
        fastify.localStrategy
      ], {
        relation: 'and'
      }),
      handler: (req, reply) => {
        req.log.info('User authenticated successfully');
        reply.code(200).send({ message: 'Login successful' })
      }
    })
  })
});
