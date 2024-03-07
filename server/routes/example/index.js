export default async function (fastify, _opts) {
  fastify.get('/', async function (_request, _reply) {
    return 'this is an example';
  });
}
