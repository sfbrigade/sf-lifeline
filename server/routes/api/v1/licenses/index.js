'use strict';

import verifyLicense from '../../../../helpers/license/verifyLicense.js';

export default async function (fastify) {
  fastify.get(
    '/',
    {
      schema: {
        querystring: {
          license: { type: 'string' },
        },
      },
    },
    async function (request) {
      const { license } = request.query;
      const results = await verifyLicense(license);
      return results;
    },
  );
}
