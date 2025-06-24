import { StatusCodes } from 'http-status-codes';

import { User } from '#models/user.js';

export default async function (fastify, _opts) {
  fastify.get(
    '/me',
    {
      schema: {
        response: {
          [StatusCodes.OK]: User.ResponseSchema,
        },
      },
      onRequest: fastify.requireUser(),
    },
    async (request, reply) => {
      reply.send(request.user._data);
    }
  );
}
