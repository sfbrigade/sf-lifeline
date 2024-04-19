import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/allergies', () => {
  let app;
  let headers;

  beforeEach(async (t) => {
    app = await build(t);
    await t.loadFixtures();
    headers = await t.authenticate('admin.user@test.com', 'test');
  });

  describe('GET /', () => {
    it('should return valid results for admin user', async () => {
      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy=p')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Grass Pollen' }, { name: 'Pollen' }]);
    });

    it('should return valid results for staff user', async (t) => {
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy=p')
        .headers(staffHeaders);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Grass Pollen' }, { name: 'Pollen' }]);
    });

    it('should return valid results for volunteer user', async (t) => {
      const volunteerHeaders = await t.authenticate('volunteer.user@test.com', 'test');

      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy=p')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Grass Pollen' }, { name: 'Pollen' }]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async () => {

      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy=p')

      assert.deepStrictEqual(res.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return no query message when no query provided', async () => {

      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy')
        .headers(headers);

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No query provided' });
    });

    it('should return no results from database message for an unknown allergy', async () => {

      const res = await app
        .inject()
        .get('/api/v1/allergies?allergy=newallergy')
        .headers(headers);

      assert.deepStrictEqual(JSON.parse(res.payload), []);
    });

  });
});
