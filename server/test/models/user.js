import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcrypt from 'bcrypt';

import { build } from '../helper.js';
import User from '../../models/user.js';

describe('User', () => {
  describe('isApproved', () => {
    it('returns true if account has been approved', async (t) => {
      await build(t);
      await t.loadFixtures();
      const user = new User(
        await t.prisma.user.findUnique({
          where: { email: 'admin.user@test.com' },
        }),
      );
      assert.ok(user.isApproved);
    });
  });

  describe('setPassword()', () => {
    it('hashes the new password into hashedPassword', async (t) => {
      await build(t);
      await t.loadFixtures();
      const data = await t.prisma.user.findUnique({
        where: { email: 'admin.user@test.com' },
      });
      const user = new User(data);
      await user.setPassword('newpassword');
      assert.ok(await bcrypt.compare('newpassword', data.hashedPassword));
    });
  });

  describe('comparePassword()', () => {
    it('returns true if password matches hashed password', async (t) => {
      await build(t);
      await t.loadFixtures();
      const user = new User(
        await t.prisma.user.findUnique({
          where: { email: 'admin.user@test.com' },
        }),
      );
      assert.ok(await user.comparePassword('test'));
    });
  });
});
