import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '#test/helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/medications', () => {
  describe('GET /', () => {
    it('should return valid results for admin user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?perPage=1&medication=ibuprofen&page=2>; rel="next"'
      );

      const payload = JSON.parse(reply.payload);
      assert.deepStrictEqual(payload, [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
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
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(staffHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?perPage=1&medication=ibuprofen&page=2>; rel="next"'
      );

      const payload = JSON.parse(reply.payload);
      assert.deepStrictEqual(payload, [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
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
        .get('/api/v1/medications?medication=ibuprofen&perPage=1')
        .headers(volunteerHeaders);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?perPage=1&medication=ibuprofen&page=2>; rel="next"'
      );

      const payload = JSON.parse(reply.payload);
      assert.deepStrictEqual(payload, [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
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
        .get('/api/v1/medications?medication=ibuprofen&perPage=1');

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should return paginated results of all medications when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/medications?perPage=1&medication=&page=2>; rel="next",<http://localhost/api/v1/medications?perPage=1&medication=&page=3>; rel="last"'
      );

      const payload = JSON.parse(reply.payload);
      assert.deepStrictEqual(payload, [
        {
          id: '583c7775-9466-4dab-8a4d-edf1056f097f',
          name: 'acetaminophen / ibuprofen',
          altNames: '',
          system: 'RXNORM',
          code: '818102',
          updatedAt: payload[0].updatedAt,
          updatedById: null,
          createdAt: payload[0].createdAt,
          createdById: null,
        },
      ]);
    });

    it('should return no results from database for an unknown medication', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/medications?perPage=1&medication=newmedication')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(reply.headers['link'], '');
      assert.deepStrictEqual(JSON.parse(reply.payload), []);
    });
  });

  describe('POST /register', () => {
    it('should register a new medication and store it in the database', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const newMedicationData = {
        name: 'New Test Medication',
      };

      const reply = await app
        .inject()
        .post('/api/v1/medications/register')
        .headers(headers)
        .payload(newMedicationData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const responseBody = JSON.parse(reply.payload);
      assert.ok(responseBody.id);
      assert.deepStrictEqual(responseBody.name, newMedicationData.name);
      assert.deepStrictEqual(responseBody.altNames, null);
      assert.deepStrictEqual(responseBody.system, null);
      assert.deepStrictEqual(responseBody.code, null);
      assert.deepStrictEqual(responseBody.updatedById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
      assert.deepStrictEqual(responseBody.createdById, '555740af-17e9-48a3-93b8-d5236dfd2c29');

      const storedMedication = await app.prisma.medication.findUnique({
        where: { id: responseBody.id },
      });

      assert.ok(storedMedication);
      assert.deepStrictEqual(storedMedication.name, newMedicationData.name);
      assert.deepStrictEqual(storedMedication.altNames, null);
      assert.deepStrictEqual(storedMedication.system, null);
      assert.deepStrictEqual(storedMedication.code, null);
      assert.deepStrictEqual(storedMedication.updatedById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
      assert.deepStrictEqual(storedMedication.createdById, '555740af-17e9-48a3-93b8-d5236dfd2c29');
    });

    it('should return existing medication if already registered', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const existingMedicationData = {
        name: 'acetaminophen / ibuprofen',
      };

      const reply = await app
        .inject()
        .post('/api/v1/medications/register')
        .headers(headers)
        .payload(existingMedicationData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const responseBody = JSON.parse(reply.payload);
      assert.deepStrictEqual(responseBody.name, existingMedicationData.name);
    });

    it('should return BAD_REQUEST if name is empty or just spaces', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const invalidMedicationData = {
        name: '   ',
      };

      const reply = await app
        .inject()
        .post('/api/v1/medications/register')
        .headers(headers)
        .payload(invalidMedicationData);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(JSON.parse(reply.payload).message, 'Name cannot be empty or just spaces.');
    });
  });
});
