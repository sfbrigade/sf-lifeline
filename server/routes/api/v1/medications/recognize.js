import { recognizeMedication } from '#helpers/bedrock/recognizeMedication.js';
import { Role } from '#models/user.js';

export default async function (fastify) {
  fastify.post(
    '/recognize',
    {
      onRequest: fastify.requireUser([Role.ADMIN, Role.STAFF, Role.VOLUNTEER]),
    },
    async (request, reply) => {
      const image = request.body.image;
      const { name } = await recognizeMedication(image);
      return { name };
    }
  );
}
