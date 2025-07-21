import { Prisma } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';
import Hospital from './hospital.js';

export class Physician extends Base {
  static AttributesSchema = z.object({
    firstName: z.string().nullable().optional(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    phone: Base.PhoneSchema,
    email: z.string().nullable().optional(),
  });

  static ResponseSchema = Physician.AttributesSchema.extend({
    id: z.string().uuid(),
    hospitals: z.array(Hospital.ResponseSchema).optional(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.PhysicianScalarFieldEnum, data);
  }
}

export default Physician;
