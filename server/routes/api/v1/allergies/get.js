import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import Allergy from '#models/allergy.js'

export default async function (fastify, _opts) {
	fastify.get(
		'/:id',
		{
			schema: {
				params: z.object({
					id: z.string().uuid(),
				}),
				response: {
					[StatusCodes.OK]: Allergy.ResponseSchema,
					[StatusCodes.NOT_FOUND]: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const data = await fastify.prisma.allergy.findUnique({
				where: { id },
			});

			if (!data) {
				return reply.notFound();
			}

			reply.send(data);
		}
	)
}