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

  describe('POST /', () => {
    it('should return an error if not an ADMIN, STAFF or VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app.inject().post('/api/v1/patients').payload({
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        gender: 'MALE',
        language: 'ENGLISH',
        dateOfBirth: '1990-01-01',
      });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
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
        .post('/api/v1/patients')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
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
        gender: 'MALE',
        language: 'ENGLISH',
        dateOfBirth: '1990-01-01',
      });
    });

    it('should allow STAFF to register a new patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
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
        gender: 'MALE',
        language: 'ENGLISH',
        dateOfBirth: '1990-01-01',
      });
    });

    it('should allow VOLUNTEER to register a new patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
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
        gender: 'MALE',
        language: 'ENGLISH',
        dateOfBirth: '1990-01-01',
      });
    });

    it('errors if missing required fields', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
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

    it('errors if providing a language that is not in the enum', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'UNKNOWN',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'body/language must be equal to one of the allowed values',
      );
    });
  });

  describe('PATCH /:id', () => {
    it('should return an error if not an ADMIN, STAFF or VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'FEMALE',
          language: 'TAGALOG',
          dateOfBirth: '1990-01-01',
        });

      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'FEMALE',
          language: 'TAGALOG',
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
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jane',
            dateOfBirth: '1990-01-01',
            language: 'RUSSIAN',
            codeStatus: 'COMFORT',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const {
        id,
        firstName,
        middleName,
        lastName,
        gender,
        language,
        codeStatus,
        dateOfBirth,
      } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jane');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(gender, 'MALE');
      assert.deepStrictEqual(language, 'RUSSIAN');
      assert.deepStrictEqual(codeStatus, 'COMFORT');
      assert.deepStrictEqual(dateOfBirth, '1990-01-01');
    });

    it('should allow STAFF to update a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jack',
            dateOfBirth: '1990-02-01',
            language: 'SPANISH',
            codeStatus: 'DNR',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const {
        id,
        firstName,
        middleName,
        lastName,
        gender,
        language,
        codeStatus,
        dateOfBirth,
      } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jack');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(gender, 'MALE');
      assert.deepStrictEqual(language, 'SPANISH');
      assert.deepStrictEqual(codeStatus, 'DNR');
      assert.deepStrictEqual(dateOfBirth, '1990-02-01');
    });

    it('should allow VOLUNTEER to update a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: 'Jill',
            dateOfBirth: '1990-03-01',
            gender: 'FEMALE',
            language: 'CANTONESE',
            codeStatus: 'DNI',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const {
        id,
        firstName,
        middleName,
        lastName,
        gender,
        language,
        codeStatus,
        dateOfBirth,
      } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'Jill');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(gender, 'FEMALE');
      assert.deepStrictEqual(language, 'CANTONESE');
      assert.deepStrictEqual(codeStatus, 'DNI');
      assert.deepStrictEqual(dateOfBirth, '1990-03-01');
    });

    it('should allow ADMIN to update a patient with contact data', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
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
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: ['5c057fc3-15d2-40fc-b664-707d04ba66c2'],
            medications: ['583c7775-9466-4dab-8a4d-edf1056f097f'],
            conditions: ['471c8529-81fc-4129-8ca0-f1b7406ed90c'],
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
        allergies[0].allergy.id,
        '5c057fc3-15d2-40fc-b664-707d04ba66c2',
      );
      assert.deepStrictEqual(
        medications[0].medication.id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(
        conditions[0].condition.id,
        '471c8529-81fc-4129-8ca0-f1b7406ed90c',
      );
    });

    it('should allow ADMIN to replace medical data of a patient and keep the order of the items', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: [
              '5c057fc3-15d2-40fc-b664-707d04ba66c2',

              'ebcca2da-655f-48d4-be90-307f36870dc0',
            ],
            medications: ['583c7775-9466-4dab-8a4d-edf1056f097f'],
            conditions: ['471c8529-81fc-4129-8ca0-f1b7406ed90c'],
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      let { id, allergies, medications, conditions } = JSON.parse(reply.body);
      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(
        allergies[0].allergy.id,
        '5c057fc3-15d2-40fc-b664-707d04ba66c2',
      );
      assert.deepStrictEqual(
        allergies[1].allergy.id,
        'ebcca2da-655f-48d4-be90-307f36870dc0',
      );
      assert.deepStrictEqual(
        medications[0].medication.id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(
        conditions[0].condition.id,
        '471c8529-81fc-4129-8ca0-f1b7406ed90c',
      );

      reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: [
              'ebcca2da-655f-48d4-be90-307f36870dc0',

              '5c057fc3-15d2-40fc-b664-707d04ba66c2',
            ],
            medications: ['583c7775-9466-4dab-8a4d-edf1056f097f'],
            conditions: [],
          },
        })
        .headers(headers);

      allergies = JSON.parse(reply.body).allergies;
      medications = JSON.parse(reply.body).medications;
      conditions = JSON.parse(reply.body).conditions;

      assert.deepStrictEqual(
        allergies[0].allergy.id,
        'ebcca2da-655f-48d4-be90-307f36870dc0',
      );
      assert.deepStrictEqual(
        allergies[1].allergy.id,
        '5c057fc3-15d2-40fc-b664-707d04ba66c2',
      );
      assert.deepStrictEqual(allergies.length, 2);
      assert.deepStrictEqual(
        medications[0].medication.id,
        '583c7775-9466-4dab-8a4d-edf1056f097f',
      );
      assert.deepStrictEqual(medications.length, 1);
      assert.deepStrictEqual(conditions.length, 0);
    });

    it('should throw an error if a medical data item does not exist in the database', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            allergies: ['5c057fc3-15d2-40fc-b664-707d04ba66c1'],
          },
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      let result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'allergies with ID 5c057fc3-15d2-40fc-b664-707d04ba66c1 does not exist in database.',
      );

      reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          medicalData: {
            medications: ['583c7775-9466-4dab-8a4d-edf1056f097f'],
            conditions: ['471c8529-81fc-4129-8ca0-f1b7406ed90a'],
          },
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'conditions with ID 471c8529-81fc-4129-8ca0-f1b7406ed90a does not exist in database.',
      );
    });

    it('should allow ADMIN to update a patient with healthcare choices', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
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
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
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
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
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

    it('should throw an error if a healthcare choices item does not exist in the database', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          healthcareChoices: {
            hospitalId: 'a50538cd-1e10-42a3-8d6b-f9ae1e48a022',
            physicianId: '1ef50c4c-92cb-4298-ab0a-ce7644513bfb',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'Hospital with ID a50538cd-1e10-42a3-8d6b-f9ae1e48a022 does not exist in database.',
      );
    });
  });
});
