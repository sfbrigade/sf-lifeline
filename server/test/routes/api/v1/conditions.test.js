import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '#test/helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/conditions', () => {
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
        .get('/api/v1/conditions?condition=diabetes&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?perPage=1&condition=diabetes&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '471c8529-81fc-4129-8ca0-f1b7406ed90c',
          name: 'Diabetes Type I',
          category: 'Endocrine',
          system: 'ICD10',
          code: 'E10.8',
        },
      ]);
    });

    it('should return valid results for staff user', async (t) => {
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=diabetes&perPage=1')
        .headers(staffHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?perPage=1&condition=diabetes&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '471c8529-81fc-4129-8ca0-f1b7406ed90c',
          name: 'Diabetes Type I',
          category: 'Endocrine',
          system: 'ICD10',
          code: 'E10.8',
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
        .get('/api/v1/conditions?condition=diabetes&perPage=1')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?perPage=1&condition=diabetes&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '471c8529-81fc-4129-8ca0-f1b7406ed90c',
          name: 'Diabetes Type I',
          category: 'Endocrine',
          system: 'ICD10',
          code: 'E10.8',
        },
      ]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=diabetes&perPage=1');

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return paginated results of all conditions when no query provided', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?perPage=1&condition=&page=2>; rel="next",<http://localhost/api/v1/conditions?perPage=1&condition=&page=3>; rel="last"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '061047c4-00b2-4793-a58b-12f93a509d23',
          name: 'Deaf',
          category: 'EENT',
          system: 'ICD10',
          code: 'H91.3',
        },
      ]);
    });

    it('should return no results from database for an unknown condition', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=newcondition')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(JSON.parse(reply.payload), []);
    });
  });
});
