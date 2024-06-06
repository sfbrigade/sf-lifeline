import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build, nodemailerMock } from '../../../helper.js';

describe('/api/v1/invites', () => {
  let app;
  let headers;

  beforeEach(async (t) => {
    app = await build(t);
    await t.loadFixtures();
    headers = await t.authenticate('admin.user@test.com', 'test');
  });

  describe('GET /', () => {
    it('should return a paginated list of Invite records', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/invites?perPage=2')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/invites?perPage=2&page=2>; rel="next"',
      );
      assert.deepStrictEqual(reply.headers['x-page'], '1');
      assert.deepStrictEqual(reply.headers['x-per-page'], '2');
      assert.deepStrictEqual(reply.headers['x-total-count'], '3');
      assert.deepStrictEqual(reply.headers['x-total-pages'], '2');

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].email, 'invited.responder.one@test.com');
      assert.deepStrictEqual(data[1].email, 'invited.staff.one@test.com');
    });
  });

  describe('POST /', () => {
    it('should create and return Invite records (and send invite emails)', async () => {
      const reply = await app
        .inject()
        .post('/api/v1/invites')
        .payload({
          recipients: `invitee.1@test.com
                       invitee.2@test.com
                       John Doe <john.doe@test.com>, "Jane M. Doe" <jane.m.doe@test.com>`,
          role: 'STAFF',
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data.length, 4);
      assert.deepStrictEqual(data[0].email, 'invitee.1@test.com');
      assert.deepStrictEqual(data[1].email, 'invitee.2@test.com');
      assert.deepStrictEqual(data[2].firstName, 'John');
      assert.deepStrictEqual(data[2].lastName, 'Doe');
      assert.deepStrictEqual(data[2].email, 'john.doe@test.com');
      assert.deepStrictEqual(data[3].firstName, 'Jane');
      assert.deepStrictEqual(data[3].middleName, 'M.');
      assert.deepStrictEqual(data[3].lastName, 'Doe');
      assert.deepStrictEqual(data[3].email, 'jane.m.doe@test.com');

      const sentMails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(sentMails.length, 4);

      const mail = sentMails.find((m) => m.to == '<invitee.1@test.com>');

      assert.ok(mail.to);
      assert.deepStrictEqual(mail.subject, 'Your invitation to SF Life Line');
    });
  });

  describe('GET /:id', () => {
    it('returns an Invite record by id', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/invites/6ed61e21-1062-4b10-a967-53b395f5c34c');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      const data = JSON.parse(reply.body);
      assert.deepStrictEqual(data, {
        id: '6ed61e21-1062-4b10-a967-53b395f5c34c',
        firstName: 'Invited',
        middleName: 'Volunteer',
        lastName: 'One',
        email: 'invited.volunteer.one@test.com',
        role: 'VOLUNTEER',
        expiresAt: '3024-04-21T23:53:41.000Z',
        invitedById: '555740af-17e9-48a3-93b8-d5236dfd2c29',
        acceptedAt: '',
        acceptedById: '',
        revokedAt: '',
        revokedById: '',
        updatedAt: '2024-04-07T23:53:41.000Z',
        createdAt: '2024-04-07T23:53:41.000Z',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('revokes an Invite record by id', async (t) => {
      const reply = await app
        .inject()
        .delete('/api/v1/invites/6ed61e21-1062-4b10-a967-53b395f5c34c')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      const invite = await t.prisma.invite.findUnique({
        where: { id: '6ed61e21-1062-4b10-a967-53b395f5c34c' },
      });
      assert.ok(invite.revokedAt);
      assert.deepStrictEqual(
        invite.revokedById,
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
      );
    });
  });
});
