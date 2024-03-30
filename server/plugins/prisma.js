import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const prismaPlugin = fp(async (fastify) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  await prisma.$connect();

  // Make Prisma Client available through the fastify server instance: server.prisma
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect();
  });
});

export default prismaPlugin;
