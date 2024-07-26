import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

export default async function (fastify, _opts) {
  fastify.get(
    '/generate',
    {
      schema: {
        querystring: {
          count: { type: 'integer' },
        },
        response: {
          [StatusCodes.OK]: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      let { count } = request.query;
      if (!count) {
        reply.badRequest();
        return;
      }
      count = parseInt(count, 10);
      if (Number.isNaN(count)) {
        reply.badRequest();
      }
      let results = [];
      for (;;) {
        const diff = count - results.length;
        for (let i = 0; i < diff; i += 1) {
          results.push(uuidv4());
        }
        // unlikely, but ensure none exist
        const records = await fastify.prisma.patient.findMany({
          where: {
            id: { in: results },
          },
        });
        if (records.length === 0) {
          break;
        }
        results.filter((id) => !records.find((r) => r.id === id));
      }
      // generate fully qualified URLs
      results = results.map((id) => `${process.env.BASE_URL}/patients/${id}`);
      reply.send(results);
    },
  );
}
