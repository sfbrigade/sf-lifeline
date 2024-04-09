import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';
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
    it('should return valid results for admin user', async (t) => {
      const res = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'acetaminophen / ibuprofen' }, { name: 'ibuprofen 125 MG' }]);
    });

    it('should return valid results for staff user', async (t) => {
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const res = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen')
        .headers(staffHeaders);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'acetaminophen / ibuprofen' }, { name: 'ibuprofen 125 MG' }]);
    });

    it('should return valid results for volunteer user', async (t) => {
      const volunteerHeaders = await t.authenticate('volunteer.user@test.com', 'test');

      const res = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'acetaminophen / ibuprofen' }, { name: 'ibuprofen 125 MG' }]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async (t) => {

      const res = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen')

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return no query message when no query provided', async (t) => {
      const res = await app
        .inject()
        .get('/api/v1/medications?medication=')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No query provided' });
    });

    it('should return no results from database message for an unknown medication', async (t) => {
      const res = await app
        .inject()
        .get('/api/v1/medications?medication=newmedication')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return no known medications for n/a', async (t) => {
      const res = await app
        .inject()
        .get('/api/v1/medications?medication=n/a')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: "No known medications" });
    });

  });
});
