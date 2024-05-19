import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Base from './base.js';
import mailer from '../helpers/email/mailer.js';

class User extends Base {
  constructor(data) {
    super(Prisma.UserScalarFieldEnum, data);
  }

  get isActive() {
    return this.isApproved && this.isEmailVerified;
  }

  get isApproved() {
    return !!this.approvedAt;
  }

  get isEmailVerified() {
    return !!this.emailVerifiedAt;
  }

  get fullNameAndEmail() {
    return `${this.firstName} ${this.middleName ?? ''} ${this.lastName} <${this.email}>`
      .trim()
      .replace(/ {2,}/g, ' ');
  }

  generateEmailVerificationToken() {
    const buffer = crypto.randomBytes(3);
    this.emailVerificationToken = buffer.toString('hex').toUpperCase();
  }

  async sendVerificationEmail() {
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

  async setPassword(password) {
    this.hashedPassword = await bcrypt.hash(password, 10);
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.hashedPassword);
  }
}

export { User, Role };

export default User;
