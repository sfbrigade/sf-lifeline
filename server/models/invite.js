import { Prisma, Role } from '@prisma/client';
import { z } from 'zod';

import Base from './base.js';
import mailer from '#helpers/email/mailer.js';

export class Invite extends Base {
  static AttributesSchema = z.object({
    firstName: z.string().nullable(),
    middleName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().email(),
    role: z.enum(Object.values(Role)),
  });

  static ResponseSchema = Invite.AttributesSchema.extend({
    id: z.string().uuid(),
    expiresAt: z.coerce.date(),
    invitedById: z.string().uuid(),
    acceptedAt: z.coerce.date().nullable(),
    acceptedById: z.string().uuid().nullable(),
    revokedAt: z.coerce.date().nullable(),
    revokedById: z.string().uuid().nullable(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
  });

  constructor (data) {
    super(Prisma.InviteScalarFieldEnum, data);
  }

  get isValid () {
    return !this.isAccepted && !this.isExpired && !this.isRevoked;
  }

  get isAccepted () {
    return !!this.acceptedAt;
  }

  get isExpired () {
    return Date.parse(this.expiresAt) < Date.now();
  }

  get isRevoked () {
    return !!this.revokedAt;
  }

  get fullNameAndEmail () {
    return `${this.firstName ?? ''} ${this.middleName ?? ''} ${this.lastName ?? ''} <${this.email}>`
      .trim()
      .replace(/ {2,}/g, ' ');
  }

  async sendInviteEmail () {
    const { firstName } = this;
    const url = `${process.env.BASE_URL}/register/${this.id}`;
    return mailer.send({
      message: {
        to: this.fullNameAndEmail,
      },
      template: 'invite',
      locals: {
        firstName,
        url,
      },
    });
  }
}

export default Invite;
