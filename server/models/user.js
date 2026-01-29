import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';

import Base from './base.js';
import mailer from '#helpers/email/mailer.js';

const UserAttributesSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be between 2 and 30 characters long')
    .max(30, 'First name must be between 2 and 30 characters long'),

  middleName: z
    .string()
    .max(30, 'Middle name must be at most 30 characters long')
    .nullable()
    .optional(),

  lastName: z
    .string()
    .min(2, 'Last name must be between 2 and 30 characters long')
    .max(30, 'Last name must be between 2 and 30 characters long'),

  email: z.string().email('Invalid email format'),

  licenseNumber: z.string().nullable().optional(),
});

const UserPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    'Password must include uppercase, lowercase, number, and special character'
  );

const UserRegisterSchema = UserAttributesSchema.extend({
  password: UserPasswordSchema,
  inviteId: z.string().uuid().optional(),
});

const UserResponseSchema = UserAttributesSchema.extend({
  id: z.string().uuid(),
  emailVerifiedAt: z.coerce.date().nullable(),
  licenseData: z.object({}).nullable(),
  role: z.string(),
  patientNotification: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  approvedAt: z.coerce.date().nullable(),
  approvedById: z.string().uuid().nullable(),
  rejectedAt: z.coerce.date().nullable(),
  rejectedById: z.string().uuid().nullable(),
  disabledAt: z.coerce.date().nullable(),
  disabledById: z.string().uuid().nullable(),
});

const UserUpdateSchema = UserAttributesSchema.extend({
  password: UserPasswordSchema.or(z.literal('')),
  role: z.string(),
  deactivatedAt: z.coerce.date().nullable(),
  patientNotification: z.boolean()
}).partial();

class User extends Base {
  static Role = Role;

  static PasswordSchema = UserPasswordSchema;
  static RegisterSchema = UserRegisterSchema;
  static ResponseSchema = UserResponseSchema;
  static UpdateSchema = UserUpdateSchema;

  constructor (data) {
    super(Prisma.UserScalarFieldEnum, data);
  }

  get isActive () {
    return this.isApproved && this.isEmailVerified && !this.isDisabled;
  }

  get isUnapproved () {
    return !this.isApproved && !this.isRejected;
  }

  get isApproved () {
    return !!this.approvedAt;
  }

  get isRejected () {
    return !!this.rejectedAt;
  }

  get isDisabled () {
    return !!this.disabledAt;
  }

  get isEmailVerified () {
    return !!this.emailVerifiedAt;
  }

  get isPasswordResetTokenValid () {
    return new Date() <= new Date(this.passwordResetExpires);
  }

  get fullNameAndEmail () {
    return `${this.firstName} ${this.middleName ?? ''} ${this.lastName} <${this.email}>`
      .trim()
      .replace(/ {2,}/g, ' ');
  }

  generateEmailVerificationToken () {
    this.emailVerificationToken = crypto.randomUUID();
  }

  async sendVerificationEmail () {
    const { firstName } = this;
    const url = `${process.env.BASE_URL}/verify/${this.emailVerificationToken}`;
    return mailer.send({
      message: {
        to: this.fullNameAndEmail,
      },
      template: 'verify',
      locals: {
        firstName,
        url,
      },
    });
  }

  generatePasswordResetToken () {
    this.passwordResetToken = crypto.randomUUID();
  }

  async sendPasswordResetEmail () {
    const { firstName } = this;
    const url = `${process.env.BASE_URL}/password/${this.passwordResetToken}`;
    return mailer.send({
      message: {
        to: this.fullNameAndEmail,
      },
      template: 'passwordReset',
      locals: {
        firstName,
        url,
      },
    });
  }

  async sendPasswordResetSuccessEmail () {
    const { firstName } = this;
    const url = `${process.env.BASE_URL}/login`;
    return mailer.send({
      message: {
        to: this.fullNameAndEmail,
      },
      template: 'passwordResetSuccess',
      locals: {
        firstName,
        url,
      },
    });
  }

  async setPassword (password) {
    this.hashedPassword = await bcrypt.hash(password, 10);
  }

  async comparePassword (password) {
    return bcrypt.compare(password, this.hashedPassword);
  }
}

export { User, Role };

export default User;
