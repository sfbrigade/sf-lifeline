import { Prisma, CodingSystem } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';

export class Condition extends Base {
  static AttributesSchema = z.object({
    name: z.string(),
    category: z.string().nullable().optional(),
    system: z.enum(Object.values(CodingSystem)).nullable().optional(),
    code: z.string().nullable().optional(),
  });

  static ResponseSchema = Condition.AttributesSchema.extend({
    id: z.string().uuid(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.ConditionScalarFieldEnum, data);
  }
}

export default Condition;
