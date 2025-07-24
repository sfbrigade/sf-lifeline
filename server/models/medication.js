import { Prisma, CodingSystem } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';

export class Medication extends Base {
  static AttributesSchema = z.object({
    name: z.string(),
    altNames: z.string().nullable().optional(),
    system: z.enum(Object.values(CodingSystem)).nullable().optional(),
    code: z.string().nullable().optional(),
  });

  static ResponseSchema = Medication.AttributesSchema.extend({
    id: z.string().uuid(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.MedicationScalarFieldEnum, data);
  }
}

export default Medication;
