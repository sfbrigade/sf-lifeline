import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This plug-in configures static file serving for the built
 * files from the client SPA.
 *
 * @see https://github.com/fastify/fastify-static
 */
export default fp(async (fastify) => {
  fastify.register(fastifyStatic.default, {
    root: path.resolve(__dirname, '../../client/dist'),
    wildcard: false,
  });
});
