export default async function (fastify, _opts) {
  // add a logout route
  fastify.get('/logout', (request, reply) => {
    request.session.delete();
    reply.send();
  });
}
