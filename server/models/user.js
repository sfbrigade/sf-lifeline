import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Base from './base.js';

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

  generateEmailVerificationToken() {
    const buffer = crypto.randomBytes(3);
    this.emailVerificationToken = buffer.toString('hex').toUpperCase();
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
