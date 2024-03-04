export default async function (fastify, _opts) {
  fastify.get('/', async function (_request, _reply) {
    return { root: true };
  });

  fastify.register(import('./api/v1/users/index.js'), { prefix: '/user' });
}
