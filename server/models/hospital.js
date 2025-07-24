import { Prisma } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';

export class Hospital extends Base {
  static AttributesSchema = z.object({
    name: z.string(),
    address: z.string().nullable().optional(),
    phone: Base.PhoneSchema,
    email: z.string().nullable().optional(),
  });

  static ResponseSchema = Hospital.AttributesSchema.extend({
    id: z.string().uuid(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.HospitalScalarFieldEnum, data);
  }
}

export default Hospital;
