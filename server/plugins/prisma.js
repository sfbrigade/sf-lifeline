import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const prismaPlugin = fp(async (server, _options) => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  await prisma.$connect();

  // Make Prisma Client available through the fastify server instance: server.prisma
  server.decorate('prisma', prisma);

  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
});

export default prismaPlugin;
