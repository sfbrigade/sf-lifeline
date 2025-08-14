/**
 * NPI Registry API proxy route to handle CORS issues
 */

export default async function npiRegistryRoutes(fastify, options) {
  // GET /api/npi-registry - Proxy requests to NPI Registry API
  fastify.get('/npi-registry', {
    schema: {
      description: 'Search NPI Registry for organizations',
      tags: ['npi'],
      querystring: {
        type: 'object',
        properties: {
          organization_name: { type: 'string' },
          state: { type: 'string', minLength: 2, maxLength: 2 }
        },
        required: ['organization_name', 'state']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            result_count: { type: 'number' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  basic: {
                    type: 'object',
                    properties: {
                      organization_name: { type: 'string' },
                      organization_other_name: { type: 'string' }
                    }
                  },
                  number: { type: 'string' },
                  addresses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        address_1: { type: 'string' },
                        address_2: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        postal_code: { type: 'string' },
                        telephone_number: { type: 'string' },
                        address_type: { type: 'string' },
                        address_purpose: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { organization_name, state } = request.query;

    try {
      // Build the NPI Registry API URL
      const npiUrl = new URL('https://npiregistry.cms.hhs.gov/api/');
      npiUrl.searchParams.set('enumeration_type', 'NPI-2');
      npiUrl.searchParams.set('organization_name', organization_name);
      npiUrl.searchParams.set('state', state.toUpperCase());
      npiUrl.searchParams.set('limit', '50'); // Reasonable limit
      npiUrl.searchParams.set('skip', '0');

      // Make the request to NPI Registry API
      const response = await fetch(npiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SF-Lifeline/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`NPI Registry API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Return the data with CORS headers
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
      
      return data;
    } catch (error) {
      fastify.log.error('NPI Registry API error:', error);
      reply.code(500).send({
        error: 'Failed to fetch data from NPI Registry',
        message: error.message
      });
    }
  });

  // OPTIONS for CORS preflight
  fastify.options('/npi-registry', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    reply.code(204).send();
  });
}
