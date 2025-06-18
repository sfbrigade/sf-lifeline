import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '#test/helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/medications', () => {
  let app;
  let headers;

  beforeEach(async (t) => {
    app = await build(t);
    await t.loadFixtures();
    headers = await t.authenticate('admin.user@test.com', 'test');
  });

  describe('GET /', () => {
    it('should return valid results for admin user', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?medication=ibuprofen&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
        },
      ]);
    });

    it('should return valid results for staff user', async (t) => {
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(staffHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?medication=ibuprofen&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
        },
      ]);
    });

    it('should return valid results for volunteer user', async (t) => {
      const volunteerHeaders = await t.authenticate(
        'volunteer.user@test.com',
        'test'
      );

      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?medication=ibuprofen&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
        },
      ]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen&perPage=1');

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return paginated results of all medications when no query provided', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?medication=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/medications?medication=&perPage=1&page=3>; rel="last"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
        },
      ]);
    });

    it('should return no results from database for an unknown medication', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=newmedication&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(JSON.parse(reply.payload), []);
    });
  });
});
