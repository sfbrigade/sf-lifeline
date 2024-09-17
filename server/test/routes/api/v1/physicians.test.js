import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

describe('/api/v1/physicians', () => {
  describe('GET /', () => {
    it('should return all physicians for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/physicians?physician=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/physicians?physician=&perPage=1&page=3>; rel="last"',
      );
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
    });

    it('should return physicians for STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 3);
    });

    it('should return physicians for VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 3);
    });

    it('should return no physicians for FIRST_RESPONDER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('first.responder@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return a physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 2);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'Bob');
      assert.deepStrictEqual(JSON.parse(reply.payload)[1].firstName, 'John');
    });

    it('should return a physician from querying for their first, last, and full name', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=john')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'John');

      const reply2 = await app
        .inject()
        .get('/api/v1/physicians?physician=john smith')
        .headers(headers);

      assert.deepStrictEqual(reply2.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply2.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].firstName, 'John');
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].lastName, 'Smith');
    });
  });
});
