import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const NpiResultSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  npi: z.string(),
});

export default async function (fastify) {
  fastify.get(
    '',
    {
      schema: {
        querystring: z.object({
          name: z.string().min(1, 'Organization name is required'),
          state: z.string().length(2, 'State code must be 2 letters'),
        }),
        response: {
          [StatusCodes.OK]: z.array(NpiResultSchema),
          [StatusCodes.BAD_GATEWAY]: z.object({ message: z.string() }),
          [StatusCodes.INTERNAL_SERVER_ERROR]: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, state } = request.query;
      const params = new URLSearchParams({
        version: '2.1',
        enumeration_type: 'NPI-2',
        organization_name: name,
        state,
      });

      try {
        const response = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params.toString()}`);
        if (!response.ok) {
          return reply
            .status(StatusCodes.BAD_GATEWAY)
            .send({ message: 'Failed to fetch NPI registry' });
        }
        const data = await response.json();
        const results = data.results?.map(result => {
          const location = result.addresses?.find(addr => addr.address_purpose === 'LOCATION');
          const address = location
            ? `${location.address_1}${location.address_2 ? ' ' + location.address_2 : ''}, ${location.city}, ${location.state} ${location.postal_code}`
            : 'N/A';
          const phone = location?.telephone_number || 'N/A';
          const organizationName = result.basic?.organization_name || 'N/A';
          const npi = String(result.number);
          return { name: organizationName, address, phone, npi };
        }) ?? [];
        return results;
      } catch (err) {
        request.log.error(err);
        return reply
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: 'Error fetching NPI data' });
      }
    }
  );
}
