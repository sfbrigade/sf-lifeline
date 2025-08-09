import { Prisma } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';

export class Contact extends Base {
  static AttributesSchema = z.object({
    firstName: z.string().nullable().optional(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    phone: Base.PhoneSchema,
    email: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    relationship: z.string().nullable().optional(),
  });

  static ResponseSchema = Contact.AttributesSchema.extend({
    id: z.string().uuid(),
    updatedAt: z.date(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.ContactScalarFieldEnum, data);
  }
}

export default Contact;
