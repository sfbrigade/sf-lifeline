"use strict"

import verifyLicense from "../../../../helpers/verifyLicense.js";

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
