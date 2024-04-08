import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

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
});
