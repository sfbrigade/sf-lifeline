'use strict'

import verifyLicense from "../../../../helpers/verifyLicense.js";

// User template for the routes
export default async function (fastify, opts) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          license: { type: 'string' }
        }
      }
    },
    async function (request, reply) {
      const { license } = request.query
      const results = await verifyLicense(license)
      return results;
    });
}
