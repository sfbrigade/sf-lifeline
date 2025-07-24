import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '#test/helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/allergies', () => {
  describe('GET /', () => {
    it('should return valid results for admin user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=p&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/allergies?perPage=1&allergy=p&page=2>; rel="next"'
      );

      const payload = JSON.parse(reply.body);
      assert.deepStrictEqual(payload, [
        {
          id: 'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
          name: 'Grass Pollen',
          type: 'OTHER',
          system: 'SNOMED',
          code: '418689008',
          updatedAt: payload[0].updatedAt,
          updatedById: null,
          createdAt: payload[0].createdAt,
          createdById: null,
        },
      ]);
    });

    it('should return valid results for staff user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const staffHeaders = await t.authenticate('staff.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=p&perPage=1')
        .headers(staffHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/allergies?perPage=1&allergy=p&page=2>; rel="next"'
      );
      const payload = JSON.parse(reply.body);
      assert.deepStrictEqual(payload, [
        {
          id: 'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
          name: 'Grass Pollen',
          type: 'OTHER',
          system: 'SNOMED',
          code: '418689008',
          updatedAt: payload[0].updatedAt,
          updatedById: null,
          createdAt: payload[0].createdAt,
          createdById: null,
        },
      ]);
    });

    it('should return valid results for volunteer user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const volunteerHeaders = await t.authenticate(
        'volunteer.user@test.com',
        'test'
      );

      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=p&perPage=1')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/allergies?perPage=1&allergy=p&page=2>; rel="next"'
      );
      const payload = JSON.parse(reply.body);
      assert.deepStrictEqual(payload, [
        {
          id: 'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
          name: 'Grass Pollen',
          type: 'OTHER',
          system: 'SNOMED',
          code: '418689008',
          updatedAt: payload[0].updatedAt,
          updatedById: null,
          createdAt: payload[0].createdAt,
          createdById: null,
        },
      ]);
    });

    it('require a user to be admin/staff/volunteer to make requests', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=p&perPage=1');

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return paginated results of all allergies when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/allergies?perPage=1&allergy=&page=2>; rel="next",<http://localhost/api/v1/allergies?perPage=1&allergy=&page=3>; rel="last"'
      );
      const payload = JSON.parse(reply.body);
      assert.deepStrictEqual(payload, [
        {
          id: 'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
          name: 'Grass Pollen',
          type: 'OTHER',
          system: 'SNOMED',
          code: '418689008',
          updatedAt: payload[0].updatedAt,
          updatedById: null,
          createdAt: payload[0].createdAt,
          createdById: null,
        },
      ]);
    });

    it('should return no results from database an unknown allergy', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/allergies?allergy=newallergy&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(JSON.parse(reply.payload), []);
    });
  });

  describe('POST /register', () => {
    it('should register a new allergy and store it in the database', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const newAllergyData = {
        name: 'New Test Allergy',
        type: 'OTHER',
      };

      const reply = await app
        .inject()
        .post('/api/v1/allergies/register')
        .headers(headers)
        .payload(newAllergyData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const responseBody = JSON.parse(reply.payload);
      assert.ok(responseBody.id);
      assert.deepStrictEqual(responseBody.name, newAllergyData.name);
      assert.deepStrictEqual(responseBody.type, newAllergyData.type);
      assert.deepStrictEqual(responseBody.system, null);
      assert.deepStrictEqual(responseBody.code, null);
      assert.deepStrictEqual(responseBody.updatedById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
      assert.deepStrictEqual(responseBody.createdById, '555740af-17e9-48a3-93b8-d5236dfd2c29');

      const storedAllergy = await app.prisma.allergy.findUnique({
        where: { id: responseBody.id },
      });

      assert.ok(storedAllergy);
      assert.deepStrictEqual(storedAllergy.name, newAllergyData.name);
      assert.deepStrictEqual(storedAllergy.type, newAllergyData.type);
      assert.deepStrictEqual(storedAllergy.system, null);
      assert.deepStrictEqual(storedAllergy.code, null);
      assert.deepStrictEqual(storedAllergy.updatedById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
      assert.deepStrictEqual(storedAllergy.createdById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
    });

    it('should return existing allergy if already registered', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const existingAllergyData = {
        name: 'Grass Pollen',
        type: 'OTHER',
      };

      const reply = await app
        .inject()
        .post('/api/v1/allergies/register')
        .headers(headers)
        .payload(existingAllergyData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const responseBody = JSON.parse(reply.payload);
      assert.deepStrictEqual(responseBody.name, existingAllergyData.name);
      assert.deepStrictEqual(responseBody.type, existingAllergyData.type);
    });

    it('should return BAD_REQUEST if name is empty or just spaces', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const invalidAllergyData = {
        name: '   ',
        type: 'DRUG',
      };

      const reply = await app
        .inject()
        .post('/api/v1/allergies/register')
        .headers(headers)
        .payload(invalidAllergyData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(JSON.parse(reply.payload).message, 'Name cannot be empty or just spaces.');
    });
  });
});
