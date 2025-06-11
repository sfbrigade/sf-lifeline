import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/conditions', () => {
  let app;
  let headers;

  beforeEach(async (t) => {
    app = await build(t);
    await t.loadFixtures();
    headers = await t.authenticate('admin.user@test.com', 'test');
  });

  describe('POST /register', () => {
    it('should register a new condition and store it in the database', async () => {
      const newConditionData = {
        name: 'New Test Condition',
        category: 'Unknown',
        system: 'SNOMED',
        code: 'Unknown',
      };

      const reply = await app
        .inject()
        .post('/api/v1/conditions/register')
        .headers(headers)
        .payload(newConditionData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const responseBody = JSON.parse(reply.payload);
      assert.ok(responseBody.id);
      assert.deepStrictEqual(responseBody.name, newConditionData.name);
      assert.deepStrictEqual(responseBody.category, newConditionData.category);
      assert.deepStrictEqual(responseBody.system, newConditionData.system);
      assert.deepStrictEqual(responseBody.code, newConditionData.code);

      const storedCondition = await app.prisma.condition.findUnique({
        where: { id: responseBody.id },
      });

      assert.ok(storedCondition);
      assert.deepStrictEqual(storedCondition.name, newConditionData.name);
      assert.deepStrictEqual(storedCondition.category, newConditionData.category);
      assert.deepStrictEqual(storedCondition.system, newConditionData.system);
      assert.deepStrictEqual(storedCondition.code, newConditionData.code);
    });

    it('should return existing condition if already registered', async () => {
      const existingConditionData = {
        name: 'Asthma',
        category: 'Respiratory',
        system: 'ICD10',
        code: 'J45.909',
      };

      const reply = await app
        .inject()
        .post('/api/v1/conditions/register')
        .headers(headers)
        .payload(existingConditionData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const responseBody = JSON.parse(reply.payload);
      assert.deepStrictEqual(responseBody.name, existingConditionData.name);
      assert.deepStrictEqual(responseBody.category, existingConditionData.category);
      assert.deepStrictEqual(responseBody.system, existingConditionData.system);
      assert.deepStrictEqual(responseBody.code, existingConditionData.code);
    });

    it('should return BAD_REQUEST if name is empty or just spaces', async () => {
      const invalidConditionData = {
        name: '   ',
        category: 'Unknown',
        system: 'SNOMED',
        code: 'Unknown',
      };

      const reply = await app
        .inject()
        .post('/api/v1/conditions/register')
        .headers(headers)
        .payload(invalidConditionData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(JSON.parse(reply.payload).message, 'Name cannot be empty or just spaces.');
    });
  });

  describe('GET /', () => {
    it('should return valid results for admin user', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=a&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?condition=a&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Asthma',
          category: 'Respiratory',
          system: 'ICD10',
          code: 'J45.909',
        },
      ]);
    });

    it('should return valid results for staff user', async (t) => {
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=a&perPage=1')
        .headers(staffHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?condition=a&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Asthma',
          category: 'Respiratory',
          system: 'ICD10',
          code: 'J45.909',
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
        .get('/api/v1/conditions?condition=a&perPage=1')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/conditions?condition=a&perPage=1&page=2>; rel="next"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Asthma',
          category: 'Respiratory',
          system: 'ICD10',
          code: 'J45.909',
        },
      ]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=a&perPage=1');

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
        '<http://localhost/api/v1/conditions?condition=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/conditions?condition=&perPage=1&page=3>; rel="last"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload), [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Asthma',
          category: 'Respiratory',
          system: 'ICD10',
          code: 'J45.909',
        },
      ]);
    });

    it('should return no results from database for an unknown condition', async () => {
      const reply = await app
        .inject()
        .get('/api/v1/conditions?condition=newcondition&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(JSON.parse(reply.payload), []);
    });
  });
});
