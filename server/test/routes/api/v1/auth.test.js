import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

describe('/api/v1/auth', () => {
  describe('POST /login', () => {
    it('should return not found for email that is not registered', async (t) => {
      const app = await build(t);
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'not.found@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return unauthorized for invalid password', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'admin.user@test.com',
        password: 'invalid',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return forbidden for a user with unverified email', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'unverified.email@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return forbidden for an unapproved user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'unapproved.user@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return ok and a secure session cookie for valid credentials and valid user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'admin.user@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.OK);
      const cookie = response.headers['set-cookie']
        ?.split(';')
        .map((t) => t.trim());
      assert.ok(cookie[0].startsWith('session='));
      assert.ok(cookie.includes('HttpOnly'));
      assert.ok(cookie.includes('Secure'));
      assert.ok(cookie.includes('SameSite=Strict'));

      const data = JSON.parse(response.body);
      assert.deepStrictEqual(data, {
        id: '555740af-17e9-48a3-93b8-d5236dfd2c29',
        firstName: 'Admin',
        middleName: '',
        lastName: 'User',
        email: 'admin.user@test.com',
        emailVerifiedAt: data.emailVerifiedAt,
        licenseNumber: '',
        licenseData: {},
        role: 'ADMIN',
        approvedAt: data.approvedAt,
        approvedById: '',
        rejectedAt: '',
        rejectedById: '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
  });
});
