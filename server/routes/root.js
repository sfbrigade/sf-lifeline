export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    // Generate CSRF token
    const token = await reply.generateCsrf();
    return { token };
  });

  // Protect a route with CSRF protection middleware using shorthand method
  fastify.post(
    '/',
    { onRequest: fastify.csrfProtection },
    async (req, reply) => {
      // Handle the POST request
      return req.body;
    },
  );
}
