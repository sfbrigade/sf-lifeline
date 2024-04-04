import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = await fs.readFile(path.resolve(__dirname, '../../package.json'), {
  encoding: 'utf8',
});
const { version } = JSON.parse(pkg);

/**
 * This adds Swagger support to our API endpoints for generating documentation.
 */
export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'SF Life Line API',
        version,
      },
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
    },
  });
  await fastify.register(scalar, {
    routePrefix: '/api/reference',
  });
});
