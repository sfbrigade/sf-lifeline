import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This plug-in configures static file serving.
 *
 * @see https://github.com/fastify/fastify-static
 */
export default fp(async (fastify) => {
  // Serve up the built client SPA files
  fastify.register(fastifyStatic.default, {
    root: path.resolve(__dirname, '../../client/dist'),
    wildcard: false,
  });

  // Serve up the locale language files
  fastify.register(fastifyStatic.default, {
    root: path.resolve(__dirname, '../../locales'),
    prefix: '/locales/',
    wildcard: false,
    decorateReply: false // the reply decorator has been added by the first plugin registration
  });
});
