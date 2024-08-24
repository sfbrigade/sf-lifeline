export default async function (fastify, _opts) {
  // catch-all route serves single-page app
  fastify.get('*', async function (_request, reply) {
    return reply.sendFile('index.html');
  });
}
