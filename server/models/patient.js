import { Prisma, Language, CodeStatus, Gender } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';
import { User } from './user.js';
import { Contact } from './contact.js';
import { Allergy } from './allergy.js';
import { Condition } from './condition.js';
import { Medication } from './medication.js';
import { Hospital } from './hospital.js';
import { Physician } from './physician.js';

export class Patient extends Base {
  static RegisterSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().nullable().optional(),
    middleName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    dateOfBirth: z.coerce.string().date().nullable().optional(),
    gender: z.enum(Object.values(Gender)).nullable().optional(),
    language: z.enum(Object.values(Language)).nullable().optional(),
  });

  static UpdateSchema = Patient.RegisterSchema.extend({
    codeStatus: z.enum(Object.values(CodeStatus)).nullable().optional(),
    codeStatusAttached: z.boolean().nullable().optional(),
    hospitalId: z.string().uuid().nullable().optional(),
    emergencyContactId: z.string().uuid().nullable().optional(),
    physicianId: z.string().uuid().nullable().optional(),
  });

  static ResponseSchema = Patient.UpdateSchema.extend({
    emergencyContact: Contact.ResponseSchema.nullable().optional(),
    allergies: z.array(z.object({
      allergy: Allergy.ResponseSchema,
    })).optional(),
    conditions: z.array(z.object({
      condition: Condition.ResponseSchema,
    })).optional(),
    medications: z.array(z.object({
      medication: Medication.ResponseSchema,
    })).optional(),
    hospital: Hospital.ResponseSchema.nullable().optional(),
    physician: Physician.ResponseSchema.nullable().optional(),
    updatedAt: z.date(),
    updatedBy: User.ResponseSchema.optional(),
    updatedById: z.string().uuid().nullable(),
    createdAt: z.date(),
    createdBy: User.ResponseSchema.optional(),
    createdById: z.string().uuid().nullable(),
  });

  constructor (data) {
    super(Prisma.PatientScalarFieldEnum, data);
  }
}

export { CodeStatus };

export default Patient;
