import bcrypt from 'bcrypt';

// could be reimplamented with fastify-passport
export default async function (fastify, _opts) {
  // add a login route that returns a login page
  fastify.get('/login', (_request, reply) => {
    // currently only redirects to login page
    reply.redirect('/login');
  });

  // add a login route that handles the actual login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    try {
      const user = await fastify.prisma.user.findUnique({ email });
      if (!user) {
        reply.status(401);
        reply.send('No user with that email');
        return;
      }

      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        reply.status(401);
        reply.send('Invalid password');
        return;
      }
      return (request.session.authenticated = true);
    } catch (error) {
      reply.status(500);
      reply.send('Internal Server Error');
    }
  });

  // add a logout route
  fastify.get('/logout', (request, reply) => {
    if (request.session.authenticated) {
      request.session.destroy((err) => {
        if (err) {
          reply.status(500);
          reply.send('Internal Server Error');
        } else {
          reply.redirect('/');
        }
      });
    } else {
      reply.redirect('/');
    }
  });
}
