import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends({
  name: 'paginate',
  model: {
    $allModels: {
      async paginate({ page, perPage, ...options }) {
        const take = parseInt(perPage, 10);
        const skip = (parseInt(page, 10) - 1) * take;
        const context = Prisma.getExtensionContext(this);
        const total = await context.count(options);
        const records = await context.findMany({ ...options, skip, take });
        return { records, total };
      },
    },
  },
});

export default prisma;
