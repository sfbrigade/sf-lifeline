export default async function (fastify, _opts) {
  fastify.get('/', async function (_request, _reply) {
    return { root: true };
  });
}
