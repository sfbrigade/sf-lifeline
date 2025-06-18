import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { build, nodemailerMock } from '#test/helper.js';

describe('/api/v1/users', () => {
  describe('GET /me', () => {
    it('returns an unauthorized error if not logged in', async (t) => {
      const app = await build(t);
      const reply = await app.inject().get('/api/v1/users/me');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('returns the currently logged in User data', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app.inject().get('/api/v1/users/me').headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      const data = JSON.parse(reply.body);
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

  describe('GET /', () => {
    it('returns a paginated list of User records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/users?perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/users?perPage=2&page=2>; rel="next",<http://localhost/api/v1/users?perPage=2&page=5>; rel="last"'
      );
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '10');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '5');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].lastName, 'Email');
      assert.deepStrictEqual(data[0].firstName, 'Unverified');
    });

    it('returns a paginated list of unapproved User records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/users?status=unapproved&perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '2');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '1');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].lastName, 'Email');
      assert.deepStrictEqual(data[0].firstName, 'Unverified');
    });

    it('returns a paginated list of approved User records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/users?status=approved&perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/users?status=approved&perPage=2&page=2>; rel="next",<http://localhost/api/v1/users?status=approved&perPage=2&page=4>; rel="last"'
      );
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '7');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '4');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].lastName, 'Responder');
      assert.deepStrictEqual(data[0].firstName, 'First');
    });

    it('returns a paginated list of rejected User records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/users?status=rejected&perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '1');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '1');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].lastName, 'User');
      assert.deepStrictEqual(data[0].firstName, 'Rejected');
    });

    it('returns a paginated list of disabled User records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/users?status=disabled&perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '1');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '1');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].lastName, 'User');
      assert.deepStrictEqual(data[0].firstName, 'Disabled');
    });
  });

  describe('POST /register', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'Test123!',
        licenseNumber: 'P39332',
      });

      assert.deepStrictEqual(res.statusCode, StatusCodes.CREATED);

      const responseBody = JSON.parse(res.payload);

      assert.deepStrictEqual(responseBody.role, 'FIRST_RESPONDER');

      const record = await t.prisma.user.findUnique({
        where: { id: responseBody.id },
      });

      assert.deepStrictEqual(record.role, 'FIRST_RESPONDER');

      const validLicense = {
        name: 'Koo, Chih Ren Nicholas',
        licenseType: 'Paramedic',
        status: 'Active',
        licenseNumber: 'P39332',
      };

      assert.deepEqual(record.licenseNumber, 'P39332');
      assert.deepStrictEqual(record.licenseData, validLicense);

      bcrypt.compare('Test123!', record.hashedPassword, function (err, result) {
        assert.ifError(err);
        assert.deepStrictEqual(result, true);
      });

      const sentMails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(sentMails.length, 1);
      assert.deepStrictEqual(sentMails[0].to, 'John Doe <john.doe@test.com>');
      assert.deepStrictEqual(
        sentMails[0].subject,
        'Please verify your email with SF Life Line'
      );
    });

    it('can set User role and approval from an Invite', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'Test123!',
        inviteId: '6ed61e21-1062-4b10-a967-53b395f5c34c',
      });
      assert.deepStrictEqual(res.statusCode, StatusCodes.CREATED);

      const responseBody = JSON.parse(res.payload);
      assert.deepStrictEqual(responseBody.role, 'VOLUNTEER');

      const user = await t.prisma.user.findUnique({
        where: { id: responseBody.id },
      });
      assert.ok(user);
      assert.deepStrictEqual(user.role, 'VOLUNTEER');
      assert.deepStrictEqual(
        user.approvedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.deepStrictEqual(
        Date.parse(user.approvedAt),
        Date.parse('2024-04-07T16:53:41-07:00')
      );
      assert.ok(user.emailVerifiedAt);

      const invite = await t.prisma.invite.findUnique({
        where: { id: '6ed61e21-1062-4b10-a967-53b395f5c34c' },
      });
      assert.ok(invite);
      assert.ok(invite.acceptedAt);
      assert.ok(invite.acceptedById, user.id);
    });

    it('should validate all field with rules', async (t) => {
      const app = await build(t);

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: '',
        lastName: 'abcdefghijklmnopqrstuvwxyz123123123',
        email: 'john.doe@',
        password: 'invalid pass',
        licenseNumber: 'INVALIDLICENSE',
      });

      const expectedMessage = [
        {
          path: 'firstName',
          message: 'First name must be between 2 and 30 characters long',
        },
        {
          path: 'lastName',
          message: 'Last name must be between 2 and 30 characters long',
        },
        { path: 'email', message: 'Invalid email format' },
        {
          path: 'password',
          message:
            'Password must include uppercase, lowercase, number, and special character',
        },
        { path: 'licenseNumber', message: 'No license match' },
      ];
      const { message } = JSON.parse(res.body);

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.deepStrictEqual(message, expectedMessage);
    });

    it('should return error for duplicated email', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'admin.user@test.com',
        password: 'Test123!',
        licenseNumber: 'P39332',
      });

      const expectedMessage = [
        {
          path: 'email',
          message: 'Email already registered',
        },
      ];
      const { message } = JSON.parse(res.body);

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.deepStrictEqual(message, expectedMessage);
    });

    it('should return error for duplicated email with different case', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'ADMIN.USER@TEST.COM',
        password: 'Test123!',
        licenseNumber: 'P39332',
      });

      const expectedMessage = [
        {
          path: 'email',
          message: 'Email already registered',
        },
      ];
      const { message } = JSON.parse(res.body);

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.deepStrictEqual(message, expectedMessage);
    });

    it('should return error for expired license', async (t) => {
      const app = await build(t);

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'Test123!',
        licenseNumber: 'E085213',
      });

      const expectedMessage = [
        {
          path: 'licenseNumber',
          message: 'Expired or unprocessable license data',
        },
      ];
      const { message } = JSON.parse(res.body);

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.deepStrictEqual(message, expectedMessage);
    });

    it('should return error for duplicated license', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'Test123!',
        licenseNumber: 'E148420',
      });

      const expectedMessage = [
        {
          path: 'licenseNumber',
          message: 'License already registered',
        },
      ];
      const { message } = JSON.parse(res.body);

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
      assert.deepStrictEqual(message, expectedMessage);
    });
  });

  describe('PATCH /:id/approve', () => {
    it('should return an error if not an ADMIN or STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/approve');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('volunteer.user@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/approve')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/approve')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to approve a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/approve')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.approvedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(data.approvedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.approvedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(user.approvedAt);
    });

    it('should allow STAFF to approve a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/approve')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.approvedById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(data.approvedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.approvedById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(user.approvedAt);
    });
  });

  describe('PATCH /:id/reject', () => {
    it('should return an error if not an ADMIN or STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/reject');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('volunteer.user@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/reject')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/reject')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to reject a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/reject')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.rejectedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(data.rejectedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.rejectedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(user.rejectedAt);
    });

    it('should allow STAFF to reject a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/f4a4be16-e1a5-49dd-9f21-11b1650057f5/reject')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.rejectedById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(data.rejectedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.rejectedById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(user.rejectedAt);
    });
  });

  describe('PATCH /:id/disable', () => {
    it('should return an error if not an ADMIN or STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/users/5c8260f3-a935-4b99-856f-f8cf4dc8848f/disable');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('volunteer.user@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/5c8260f3-a935-4b99-856f-f8cf4dc8848f/disable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/5c8260f3-a935-4b99-856f-f8cf4dc8848f/disable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to disable a user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/5c8260f3-a935-4b99-856f-f8cf4dc8848f/disable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.disabledById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(data.disabledAt);

      const user = await t.prisma.user.findUnique({
        where: { id: '5c8260f3-a935-4b99-856f-f8cf4dc8848f' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.disabledById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29'
      );
      assert.ok(user.disabledAt);
    });

    it('should allow STAFF to reject a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/5c8260f3-a935-4b99-856f-f8cf4dc8848f/disable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(
        data.disabledById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(data.disabledAt);

      const user = await t.prisma.user.findUnique({
        where: { id: '5c8260f3-a935-4b99-856f-f8cf4dc8848f' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.disabledById,
        'b6310669-1400-4346-ae61-7f872dfdedd3'
      );
      assert.ok(user.disabledAt);
    });
  });

  describe('PATCH /:id/enable', () => {
    it('should return an error if not an ADMIN or STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/users/df1e3040-ae06-4a4f-a15b-be2bf0bd0b39/enable');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('volunteer.user@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/df1e3040-ae06-4a4f-a15b-be2bf0bd0b39/enable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/users/df1e3040-ae06-4a4f-a15b-be2bf0bd0b39/enable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to re-enable a user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/df1e3040-ae06-4a4f-a15b-be2bf0bd0b39/enable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.disabledById, '');
      assert.deepStrictEqual(data.disabledAt, '');

      const user = await t.prisma.user.findUnique({
        where: { id: 'df1e3040-ae06-4a4f-a15b-be2bf0bd0b39' },
      });
      assert.ok(user);
      assert.deepStrictEqual(user.disabledById, null);
      assert.deepStrictEqual(user.disabledAt, null);
    });

    it('should allow STAFF to reject a pending user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/users/df1e3040-ae06-4a4f-a15b-be2bf0bd0b39/enable')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.disabledById, '');
      assert.deepStrictEqual(data.disabledAt, '');

      const user = await t.prisma.user.findUnique({
        where: { id: 'df1e3040-ae06-4a4f-a15b-be2bf0bd0b39' },
      });
      assert.ok(user);
      assert.deepStrictEqual(user.disabledById, null);
      assert.deepStrictEqual(user.disabledAt, null);
    });
  });

  describe('PATCH /verify', () => {
    it('should allow user to verify account through email verification', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const reply = await app.inject().patch('/api/v1/users/verify').payload({
        emailVerificationToken: 'be63f7ca-64c5-4eea-a1c0-4c81e7161fa4',
      });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      const user = await t.prisma.user.findUnique({
        where: { id: 'dab5dff3-360d-4dbb-98dd-1990dfb5c4c5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(user.emailVerificationToken, null);

      const date = new Date(user.emailVerifiedAt);
      const today = new Date();

      assert.deepStrictEqual(
        date.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
    });

    it('should return 404 if no token exist', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const reply = await app.inject().patch('/api/v1/users/verify').payload({
        emailVerificationToken: 'NOEXIST',
      });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      assert.deepStrictEqual(reply.statusMessage, 'Not Found');
    });
  });
});
