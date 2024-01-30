'use strict'

import scrapeLicenses from "../../../../scraper/scraper.js";

// User template for the routes
export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const results = await scrapeLicenses()
    return results;
  });
}
