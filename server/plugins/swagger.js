import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';

/**
 * This adds Swagger support to our API endpoints for generating documentation.
 */
export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Test swagger',
        description: 'testing the fastify swagger api',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
    },
    hideUntagged: false,
    exposeRoute: true,
  });
  await fastify.register(scalar, {
    routePrefix: '/api/reference',
  });
});
