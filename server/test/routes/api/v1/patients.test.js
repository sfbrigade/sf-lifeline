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
      await t.loadFixtures();

      let reply = await app.inject().post('/api/v1/patients/register').payload({
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .post('/api/v1/patients/register')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
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
      assert.deepStrictEqual(result, {
        id: result.id,
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
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
      assert.deepStrictEqual(result, {
        id: result.id,
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
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
      assert.deepStrictEqual(result, {
        id: result.id,
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
      });
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
      assert.deepStrictEqual(
        result.message,
        "body must have required property 'firstName'",
      );
    });
  });

  describe('PATCH /update/:patientId', () => {
    it('should return an error if not an ADMIN, STAFF or VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to update a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jane',
            dateOfBirth: '1990-01-01',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { id, firstName, middleName, lastName, dateOfBirth } = JSON.parse(
        reply.body,
      );
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jane');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '1990-01-01');
    });

    it('should allow STAFF to update a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jack',
            dateOfBirth: '1990-02-01',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { id, firstName, middleName, lastName, dateOfBirth } = JSON.parse(
        reply.body,
      );
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jack');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '1990-02-01');
    });

    it('should allow VOLUNTEER to update a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jill',
            dateOfBirth: '1990-03-01',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { id, firstName, middleName, lastName, dateOfBirth } = JSON.parse(
        reply.body,
      );
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jill');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '1990-03-01');
    });

    it('should allow ADMIN to update a patient with contact data', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          contactData: {
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '123-456-7890',
            relationship: 'Mother',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { emergencyContact } = JSON.parse(reply.body);
      assert.deepStrictEqual(emergencyContact, {
        id: emergencyContact.id,
        firstName: 'Jane',
        middleName: '',
        lastName: 'Doe',
        phone: '123-456-7890',
        relationship: 'Mother',
      });
    });

    it('should allow ADMIN to update a patient with medical data', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: [
              {
                id: '5c057fc3-15d2-40fc-b664-707d04ba66c2',
              },
            ],
            medications: [
              {
                id: '583c7775-9466-4dab-8a4d-edf1056f097f',
              },
            ],
            conditions: [
              {
                id: '471c8529-81fc-4129-8ca0-f1b7406ed90c',
              },
            ],
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const {
        id,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        allergies,
        medications,
        conditions,
      } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'John');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '2000-10-05');
      assert.deepStrictEqual(
        allergies[0].id,
        '5c057fc3-15d2-40fc-b664-707d04ba66c2',
      );
      assert.deepStrictEqual(
        medications[0].id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(
        conditions[0].id,
        '471c8529-81fc-4129-8ca0-f1b7406ed90c',
      );
    });

    it('should allow ADMIN to replace medical data of a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: [
              {
                id: '5c057fc3-15d2-40fc-b664-707d04ba66c2',
              },
            ],
            medications: [
              {
                id: '583c7775-9466-4dab-8a4d-edf1056f097f',
              },
            ],
            conditions: [
              {
                id: '471c8529-81fc-4129-8ca0-f1b7406ed90c',
              },
            ],
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      let { id, allergies, medications, conditions } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(
        allergies[0].id,
        '5c057fc3-15d2-40fc-b664-707d04ba66c2',
      );
      assert.deepStrictEqual(
        medications[0].id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(
        conditions[0].id,
        '471c8529-81fc-4129-8ca0-f1b7406ed90c',
      );

      reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: [
              {
                id: 'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
              },
            ],
            medications: [
              {
                id: '583c7775-9466-4dab-8a4d-edf1056f097f',
              },
            ],
            conditions: [],
          },
        })
        .headers(headers);

      allergies = JSON.parse(reply.body).allergies;
      medications = JSON.parse(reply.body).medications;
      conditions = JSON.parse(reply.body).conditions;

      assert.deepStrictEqual(
        allergies[0].id,
        'ceb1cd02-d5a7-46ef-915f-766cee886d0d',
      );
      assert.deepStrictEqual(allergies.length, 1);
      assert.deepStrictEqual(
        medications[0].id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(medications.length, 1);
      assert.deepStrictEqual(conditions.length, 0);
    });

    it('should allow ADMIN to update a patient with healthcare choices', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          healthcareChoices: {
            hospitalId: 'a50538cd-1e10-42a3-8d6b-f9ae1e48a025',
            physicianId: '1ef50c4c-92cb-4298-ab0a-ce7644513bfb',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const {
        id,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        hospital,
        physician,
      } = JSON.parse(reply.body);

      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'John');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '2000-10-05');
      assert.deepStrictEqual(
        hospital.id,
        'a50538cd-1e10-42a3-8d6b-f9ae1e48a025',
      );
      assert.deepStrictEqual(
        physician.id,
        '1ef50c4c-92cb-4298-ab0a-ce7644513bfb',
      );
    });

    it('should allow ADMIN to update healthcare choices of a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          healthcareChoices: {
            hospitalId: 'a50538cd-1e10-42a3-8d6b-f9ae1e48a025',
            physicianId: '1ef50c4c-92cb-4298-ab0a-ce7644513bfb',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      let { id, hospital, physician } = JSON.parse(reply.body);

      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(
        hospital.id,
        'a50538cd-1e10-42a3-8d6b-f9ae1e48a025',
      );
      assert.deepStrictEqual(
        physician.id,
        '1ef50c4c-92cb-4298-ab0a-ce7644513bfb',
      );

      reply = await app
        .inject()
        .patch('/api/v1/patients/update/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          healthcareChoices: {
            hospitalId: 'b50538cd-1e10-42a3-8d6b-f9ae1e48a025',
            physicianId: 'bbbf7f99-36cc-40b5-a26c-cd95daae04b5',
          },
        })
        .headers(headers);

      hospital = JSON.parse(reply.body).hospital;
      physician = JSON.parse(reply.body).physician;

      assert.deepStrictEqual(
        hospital.id,
        'b50538cd-1e10-42a3-8d6b-f9ae1e48a025',
      );
      assert.deepStrictEqual(
        physician.id,
        'bbbf7f99-36cc-40b5-a26c-cd95daae04b5',
      );
    });
  });
});
