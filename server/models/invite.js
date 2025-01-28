import { Prisma } from '@prisma/client';

import Base from './base.js';
import mailer from '../helpers/email/mailer.js';

class Invite extends Base {
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

export { Invite };

export default Invite;
