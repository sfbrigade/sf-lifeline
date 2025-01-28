import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { build, nodemailerMock } from '../../../helper.js';

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
      const { message } = JSON.parse(response.body);
      assert.deepStrictEqual(
        message,
        'Your account has not been verified. Please check your inbox to verify your account.'
      );
    });

    it('should return forbidden for an unapproved user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'unapproved.user@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.FORBIDDEN);
      const { message } = JSON.parse(response.body);
      assert.deepStrictEqual(
        message,
        'Your account has not been approved by admins yet. Please contact support or wait for further instructions.'
      );
    });

    it('should return forbidden for a rejected user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'rejected.user@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.FORBIDDEN);
      const { message } = JSON.parse(response.body);
      assert.deepStrictEqual(
        message,
        'Your account has been rejected or disabled by admins. Please contact support for further instructions.'
      );
    });

    it('should return forbidden for a disabled user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'disabled.user@test.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.FORBIDDEN);
      const { message } = JSON.parse(response.body);
      assert.deepStrictEqual(
        message,
        'Your account has been rejected or disabled by admins. Please contact support for further instructions.'
      );
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
      // Will be Secure only in production
      // assert.ok(cookie.includes('Secure'));
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

  describe('/password', () => {
    describe('POST /', () => {
      it('should allow user to request a password reset', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app.inject().post('/api/v1/auth/password').payload({
          email: 'volunteer.user@test.com',
        });

        assert.deepStrictEqual(res.statusCode, StatusCodes.OK);

        const sentMails = nodemailerMock.mock.getSentMail();

        assert.deepStrictEqual(sentMails.length, 1);
        assert.deepStrictEqual(
          sentMails[0].to,
          'Volunteer User <volunteer.user@test.com>'
        );
        assert.deepStrictEqual(
          sentMails[0].subject,
          'Reset your password for your SF Life Line account'
        );
      });

      it('should return not found if email does not exist', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app.inject().post('/api/v1/auth/password').payload({
          email: 'no-exist@test.com',
        });

        assert.deepStrictEqual(res.statusCode, StatusCodes.NOT_FOUND);
        const { message } = JSON.parse(res.body);
        assert.deepStrictEqual(
          message,
          'Email not found in SF Life Line Database'
        );
      });
    });

    describe('GET /password/:token', () => {
      it('should return status OK on valid token', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app
          .inject()
          .get(
            '/api/v1/auth/password/' + '4ae4a190-005e-4222-aac3-7dd5ff2c477f'
          );

        assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      });

      it('should return status UNAUTHORIZED on invalid token', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app
          .inject()
          .get(
            '/api/v1/auth/password/' + '3b5afcb9-1669-4196-94f1-01251e59f12c'
          );

        assert.deepStrictEqual(res.statusCode, StatusCodes.UNAUTHORIZED);
        const { message } = JSON.parse(res.body);
        assert.deepStrictEqual(
          message,
          'Password Reset Link is expired or not valid'
        );
      });

      it('should return status UNAUTHORIZED on expired token', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app
          .inject()
          .get(
            '/api/v1/auth/password/' + '9a616ebe-f68a-440a-9c4f-fca7f32c88cb'
          );

        assert.deepStrictEqual(res.statusCode, StatusCodes.UNAUTHORIZED);
        const { message } = JSON.parse(res.body);
        assert.deepStrictEqual(
          message,
          'Password Reset Link is expired or not valid'
        );
      });
    });

    describe('PATCH /password', () => {
      it('should return status OK on successful password reset', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app.inject().patch('/api/v1/auth/password').payload({
          passwordResetToken: '4ae4a190-005e-4222-aac3-7dd5ff2c477f',
          password: 'NewPassword123!',
        });

        assert.deepStrictEqual(res.statusCode, StatusCodes.OK);

        const user = await t.prisma.user.findUnique({
          where: { id: '5a848b86-e418-4f7f-9973-cbda82aaaba5' },
        });

        bcrypt.compare(
          'NewPassword123!',
          user.hashedPassword,
          function (err, result) {
            assert.ifError(err);
            assert.deepStrictEqual(result, true);
          }
        );

        assert.deepStrictEqual(user.passwordResetToken, null);
        assert.deepStrictEqual(user.passwordResetExpires, null);

        const sentMails = nodemailerMock.mock.getSentMail();
        assert.deepStrictEqual(sentMails.length, 1);
        assert.deepStrictEqual(
          sentMails[0].to,
          'ValidPasswordReset User <validreset.user@test.com>'
        );
        assert.deepStrictEqual(
          sentMails[0].subject,
          'Your SF Life Line password has been changed'
        );
      });

      it('should return status OK if bad password format', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        const res = await app.inject().patch('/api/v1/auth/password').payload({
          passwordResetToken: '4ae4a190-005e-4222-aac3-7dd5ff2c477f',
          password: 'bad',
        });

        assert.deepStrictEqual(
          res.statusCode,
          StatusCodes.UNPROCESSABLE_ENTITY
        );
        const { message } = JSON.parse(res.body);
        assert.deepStrictEqual(
          message,
          'Password must be at least 8 characters long. Password must include uppercase, lowercase, number, and special character'
        );
      });

      it('should return status UNAUTHORIZED on invalid attempt', async (t) => {
        const app = await build(t);
        await t.loadFixtures();

        let res = await app.inject().patch('/api/v1/auth/password').payload({
          passwordResetToken: '4ae4a190-005e-4222-aac3-7dd5ff2c477f',
          password: 'NewPassword123!',
        });

        assert.deepStrictEqual(res.statusCode, StatusCodes.OK);

        res = await app.inject().patch('/api/v1/auth/password').payload({
          passwordResetToken: '4ae4a190-005e-4222-aac3-7dd5ff2c477f',
          password: 'AnotherPassword123!',
        });

        const user = await t.prisma.user.findUnique({
          where: { id: '5a848b86-e418-4f7f-9973-cbda82aaaba5' },
        });

        assert.deepStrictEqual(res.statusCode, StatusCodes.UNAUTHORIZED);
        const { message } = JSON.parse(res.body);
        assert.deepStrictEqual(
          message,
          'Password Reset Link is expired or not valid'
        );

        bcrypt.compare(
          'NewPassword123!',
          user.hashedPassword,
          function (err, result) {
            assert.ifError(err);
            assert.deepStrictEqual(result, true);
          }
        );

        assert.deepStrictEqual(user.passwordResetToken, null);
        assert.deepStrictEqual(user.passwordResetExpires, null);
      });
    });
  });
});
