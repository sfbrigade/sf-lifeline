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

  describe('GET /:id', () => {
    it('should return a single allergy with valid ID', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const reply = await app.inject().get('/api/v1/allergies/ceb1cd02-d5a7-46ef-915f-766cee886d0d');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const responseBody = JSON.parse(reply.payload);
      assert.deepStrictEqual(responseBody.name, 'Grass Pollen');
      assert.deepStrictEqual(responseBody.type, 'OTHER');
      assert.deepStrictEqual(responseBody.system, 'SNOMED');
      assert.deepStrictEqual(responseBody.code, '418689008');
    });

    it('should return code 422 for invalid ID', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const reply = await app.inject().get('/api/v1/allergies/invalid1-d5a7-46ef-915f-766cee886d0d');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNPROCESSABLE_ENTITY);
    })
  })

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

  describe('PATCH /:id', () => {
    it('should update an allergy for ADMIN, STAFF', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const headers = await t.authenticate('admin.user@test.com', 'test');
      const allergyId = 'ceb1cd02-d5a7-46ef-915f-766cee886d0d';

      const allergy = await t.prisma.allergy.findUnique({
        where: {
          id: allergyId
        }
      });
      const reply = await app
        .inject()
        .patch(`/api/v1/allergies/${allergyId}`)
        .payload({
          name: 'Updated Test Allergy',
          type: 'OTHER',
          system: allergy.system,
          code: allergy.code
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const updatedAllergy = JSON.parse(reply.payload);
      assert.deepStrictEqual(updatedAllergy.name, 'Updated Test Allergy');
      assert.deepStrictEqual(updatedAllergy.type, 'OTHER');
      assert.deepStrictEqual(updatedAllergy.system, allergy.system);
      assert.deepStrictEqual(updatedAllergy.code, allergy.code);
      assert.deepStrictEqual(updatedAllergy.updatedById, '555740af-17e9-48a3-93b8-d5236dfd2c29');

      const headers2 = await t.authenticate('staff.user@test.com', 'test');
      const reply2 = await app
      .inject()
      .patch(`/api/v1/allergies/${allergyId}`)
      .payload({
        name: 'Updated Test Allergy for STAFF',
        type: 'OTHER',
        system: allergy.system,
        code: allergy.code
      })
      .headers(headers2);

      assert.deepStrictEqual(reply2.statusCode, StatusCodes.OK);
      const updatedAllergy2 = JSON.parse(reply2.payload);
      assert.deepStrictEqual(updatedAllergy2.name, 'Updated Test Allergy for STAFF');
      assert.deepStrictEqual(updatedAllergy2.type, 'OTHER');
      assert.deepStrictEqual(updatedAllergy2.system, allergy.system);
      assert.deepStrictEqual(updatedAllergy2.code, allergy.code);
      assert.deepStrictEqual(updatedAllergy2.updatedById, 'b6310669-1400-4346-ae61-7f872dfdedd3');
    });

    it('should return 404 for updating non-existent allergy', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/allergies/b05a61d3-670e-4a49-b485-b225a7c3d6a9')
        .payload({
          name: 'Updated Test Allergy',
          type: 'OTHER',
          system: 'SNOMED',
          code: 'test code'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
  })

  describe(('DELETE /:id'), () => {
    it('should delete an allergy for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const allergyId = 'ceb1cd02-d5a7-46ef-915f-766cee886d0d';
      const reply = await app
        .inject()
        .delete(`/api/v1/allergies/${allergyId}`)
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      const deletedAllergy = await t.prisma.allergy.findUnique({
        where: {
          id: allergyId
        }
      });
      assert.deepStrictEqual(deletedAllergy, null)
    });

    it('should return 404 for deleting non-existent allergy', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .delete('/api/v1/allergies/8dac39e4-21dd-4b68-9f0a-d46676bc5a20')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return an error if not ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const reply = await app
        .inject()
        .delete('/api/v1/allergies/8dac39e4-21dd-4b68-9f0a-d46676bc5a20')
      
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    })
  })
});
