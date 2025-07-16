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

    it('should return no results from database for an unknown medication', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/medications?medication=newmedication&perPage=1')
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


      const storedMedication = await app.prisma.medication.findUnique({
        where: { id: responseBody.id },
      });

      assert.ok(storedMedication);
      assert.deepStrictEqual(storedMedication.name, newMedicationData.name);
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
