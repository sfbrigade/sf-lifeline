import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
}).$extends({
  name: 'paginate',
  model: {
    $allModels: {
      async paginate ({ page, perPage, include, ...options }) {
        const take = parseInt(perPage, 10);
        const skip = (parseInt(page, 10) - 1) * take;
        const context = Prisma.getExtensionContext(this);
        const total = await context.count(options);
        const records = await context.findMany({
          ...options,
          include,
          skip,
          take,
        });
        return { records, total };
      },
    },
    patient: {
      async uuidSearch (uuid, page = 1, perPage = 25) {
        const offset = (parseInt(page) - 1) * parseInt(perPage);
        const limit = parseInt(perPage);
        const likeValue = uuid.trim() + '%';
        // Use the Prisma client directly for raw queries
        const [records, totalResult] = await Promise.all([
          prisma.$queryRaw`
            SELECT
              p.*,
              to_jsonb(cb) AS "createdBy",
              to_jsonb(ub) AS "updatedBy"
            FROM "Patient" p
            LEFT JOIN "User" cb ON p."createdById" = cb.id
            LEFT JOIN "User" ub ON p."updatedById" = ub.id
            WHERE p."id"::TEXT ILIKE ${likeValue}
            ORDER BY p."updatedAt" DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
          prisma.$queryRaw`
            SELECT COUNT(*) as total FROM "Patient"
            WHERE "id"::TEXT ILIKE ${likeValue}
          `
        ]);
        const total = parseInt(totalResult[0].total);
        return { records, total };
      }
    }
  },
});

export default prisma;
