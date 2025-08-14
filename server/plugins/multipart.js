import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

export default fp(async function (fastify) {
  fastify.register(multipart, {
    attachFieldsToBody: true,
    limits: { fileSize: 5 * 1024 * 1024 }
  });
});
