const isProduction = process.env.NODE_ENV === 'production';

export default async function (fastify, opts) {
  if (!isProduction) {
    // In development, allow developers to access the CSRF token to test the
    // server endpoints in Postman.
    fastify.get("/restore", async (req, reply) => {
      const csrfToken = await reply.generateCsrf();
      reply.status(200).send({
        'CSRF-Token': csrfToken
      });
    });
  }
}
