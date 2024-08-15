import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

describe('/api/v1/patients', () => {
  describe('GET /generate', () => {
    it('returns a list of new patient URLs', async (t) => {
      const app = await build(t);
      const reply = await app
        .inject()
        .get('/api/v1/patients/generate?count=12');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const results = JSON.parse(reply.body);
      assert.deepStrictEqual(results.length, 12);
      assert.ok(results[0].startsWith(`${process.env.BASE_URL}/patients/`));
    });
  });

  describe('POST /register', () => {
    it('should return an error if not an ADMIN, STAFF or VOLUNTEER user', async (t) => {
      const app = await build(t);
      const reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should allow ADMIN to register a new patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const result = JSON.parse(reply.body);
      assert.ok(result.id);
    });

    it('should allow STAFF to register a new patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const result = JSON.parse(reply.body);
      assert.ok(result.id);
    });

    it('should allow VOLUNTEER to register a new patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const result = JSON.parse(reply.body);
      assert.ok(result.id);
    });


    it('errors if missing required fields', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(result.message, "body must have required property 'firstName'");
    });

  });

  describe('PATCH /update/:patientId', () => {

  });
});
