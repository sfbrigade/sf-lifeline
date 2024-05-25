import fp from 'fastify-plugin';

const prismaPlugin = fp(async (fastify) => {
  const { default: prisma } = await import('../prisma/client.js');

  await prisma.$connect();

  // Make Prisma Client available through the fastify server instance: server.prisma
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect();
  });
});

export default prismaPlugin;
