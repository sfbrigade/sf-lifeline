import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { build, nodemailerMock } from '../../../helper.js';

describe('/api/v1/users', () => {
  describe('POST /register', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'test',
        licenseNumber: 'test',
      });

      assert.deepStrictEqual(res.statusCode, StatusCodes.CREATED);

      const responseBody = JSON.parse(res.payload);

      assert.deepStrictEqual(responseBody.role, 'FIRST_RESPONDER');

      const record = await t.prisma.user.findUnique({
        where: { id: responseBody.id },
      });

      assert.deepStrictEqual(record.role, 'FIRST_RESPONDER');

      bcrypt.compare('test', record.hashedPassword, function (err, result) {
        assert.deepStrictEqual(result, true);
      });

      const sentMails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(sentMails.length, 1);
      assert.deepStrictEqual(sentMails[0].to, 'John Doe <john.doe@test.com>');
      assert.deepStrictEqual(
        sentMails[0].subject,
        'Please verify your email with SF Life Line',
      );
    });

    it('can set User role and approval from an Invite', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'test',
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
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
      );
      assert.deepStrictEqual(
        Date.parse(user.approvedAt),
        Date.parse('2024-04-07T16:53:41-07:00'),
      );

      const invite = await t.prisma.invite.findUnique({
        where: { id: '6ed61e21-1062-4b10-a967-53b395f5c34c' },
      });
      assert.ok(invite);
      assert.ok(invite.acceptedAt);
      assert.ok(invite.acceptedById, user.id);
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
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
      );
      assert.ok(data.approvedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.approvedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
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
        'b6310669-1400-4346-ae61-7f872dfdedd3',
      );
      assert.ok(data.approvedAt);

      const user = await t.prisma.user.findUnique({
        where: { id: 'f4a4be16-e1a5-49dd-9f21-11b1650057f5' },
      });
      assert.ok(user);
      assert.deepStrictEqual(
        user.approvedById,
        'b6310669-1400-4346-ae61-7f872dfdedd3',
      );
      assert.ok(user.approvedAt);
    });
  });
});
