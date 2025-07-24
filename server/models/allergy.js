import { Prisma, AllergyType, CodingSystem } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';

export class Allergy extends Base {
  static AttributesSchema = z.object({
    name: z.string(),
    type: z.enum(Object.values(AllergyType)),
    system: z.enum(Object.values(CodingSystem)).nullable().optional(),
    code: z.string().nullable().optional(),
  });

  static ResponseSchema = Allergy.AttributesSchema.extend({
    id: z.string().uuid(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.AllergyScalarFieldEnum, data);
  }
}

export default Allergy;
