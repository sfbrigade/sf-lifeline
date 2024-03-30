export default async function (fastify, _opts) {
  // health check endpoint for server monitoring
  fastify.get('/health', async function (_request, _reply) {
    return { status: 'OK' };
  });
}
