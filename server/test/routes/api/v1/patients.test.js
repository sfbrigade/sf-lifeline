import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

describe('/api/v1/patients', () => {
  describe('GET /', () => {
    it('should return all patients for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/patients?patient=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/patients?patient=&perPage=1&page=3>; rel="last"',
      );
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
    });

    it('should return patients for STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 3);
    });

    it('should return patients for VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 3);
    });

    it('should return no patients for FIRST_RESPONDER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('first.responder@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return patients for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=doe')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 2);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'Jackson');
      assert.deepStrictEqual(JSON.parse(reply.payload)[1].firstName, 'John');
    });

    it('should return patients from querying for their first, last, and full name', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=john')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'John');

      const reply2 = await app
        .inject()
        .get('/api/v1/patients?patient=john doe')
        .headers(headers);

      assert.deepStrictEqual(reply2.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply2.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].firstName, 'John');
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].lastName, 'Doe');
    });

    it('should return patients with all the fields expected', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients?patient=john doe')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].id,
        '27963f68-ebc1-408a-8bb5-8fbe54671064',
      );
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'John');
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].middleName, 'A');
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].lastName, 'Doe');
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].gender, 'MALE');
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].language, 'ENGLISH');
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].dateOfBirth,
        '2000-10-05T00:00:00.000Z',
      );
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].createdBy.id,
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
      );
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].updatedBy.id,
        '555740af-17e9-48a3-93b8-d5236dfd2c29',
      );
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].createdAt,
        '2022-10-05T00:00:00.000Z',
      );
      assert.deepStrictEqual(
        JSON.parse(reply.payload)[0].updatedAt,
        '2022-10-05T00:00:00.000Z',
      );
    });

    it('should return a patient even if it has null values', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
          firstName: '',
          middleName: '',
          lastName: '',
          gender: 'MALE',
          language: 'ENGLISH',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      reply = await app
        .inject()
        .get('/api/v1/patients?patient=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 4);
    });
  });

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

  describe('GET /:id', () => {
    it('should return UNAUTHORIZED if the user is not logged in', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .get('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);
    });

    it('should allow ADMIN to retrieve a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const response = JSON.parse(reply.body);
      const { id, firstName, middleName, lastName, dateOfBirth } = response;

      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'John');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '2000-10-05');
      assert.deepStrictEqual(Object.keys(response).length, 22);
    });

    it('should throw a 404 error if a patient id does not exist', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe5467106a')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'Patient with ID 27963f68-ebc1-408a-8bb5-8fbe5467106a does not exist in database.',
      );
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
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
        id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
        id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
        id: '0849219e-e2c6-409b-bea4-1a229c3df805',
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        gender: 'MALE',
        language: 'ENGLISH',
        dateOfBirth: '1990-01-01',
      });
    });

    it('errors if creating a patient with an existing ID', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          id: '27963f68-ebc1-408a-8bb5-8fbe54671064',
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CONFLICT);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'Patient with ID 27963f68-ebc1-408a-8bb5-8fbe54671064 already exists in database.',
      );
    });

    it('errors if missing required fields', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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
          id: '0849219e-e2c6-409b-bea4-1a229c3df805',
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

    it('errors if providing a non-UUID ID', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/patients')
        .payload({
          id: 'not-a-uuid',
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          gender: 'MALE',
          language: 'ENGLISH',
          dateOfBirth: '1990-01-01',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'body/id must match format "uuid"',
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

    it('should throw an error if a patient does not exist', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/not-a-uuid')
        .payload({
          patientData: {
            firstName: 'Jane',
            dateOfBirth: '1990-01-01',
            language: 'RUSSIAN',
            codeStatus: 'COMFORT',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'Patient with ID not-a-uuid does not exist in database.',
      );
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
            phone: '(123) 456-7890',
            relationship: 'PARENT',
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
        email: '',
        phone: '(123) 456-7890',
        relationship: 'PARENT',
      });
    });

    it('should trim user inputted text', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: '  Jane  ',
            middleName: '  A  ',
            lastName: '  Doe  ',
            dateOfBirth: '1990-01-01',
            language: 'RUSSIAN',
            codeStatus: 'COMFORT',
          },
          contactData: {
            firstName: '  Smith  ',
            lastName: 'Doe  ',
            phone: '(123) 456-7890',
            relationship: 'PARENT',
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { firstName, middleName, lastName, emergencyContact } = JSON.parse(
        reply.body,
      );
      assert.deepStrictEqual(firstName, 'Jane');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');

      assert.deepStrictEqual(emergencyContact, {
        id: emergencyContact.id,
        firstName: 'Smith',
        middleName: '',
        lastName: 'Doe',
        email: '',
        phone: '(123) 456-7890',
        relationship: 'PARENT',
      });
    });

    it('optional fields should be null if not provided or sent as empty string', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          patientData: {
            firstName: '  Jane  ',
            middleName: '  ',
            lastName: '  Doe  ',
            dateOfBirth: '1990-01-01',
            language: 'RUSSIAN',
            codeStatus: 'COMFORT',
          },
          contactData: {
            firstName: '  Smith  ',
            lastName: 'Doe  ',
            relationship: 'PARENT',
          },
        })
        .headers(headers);

      const reply = await app
        .inject()
        .get('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { firstName, middleName, lastName, emergencyContact } = JSON.parse(
        reply.body,
      );

      assert.deepStrictEqual(firstName, 'Jane');
      assert.deepStrictEqual(middleName, null);
      assert.deepStrictEqual(lastName, 'Doe');

      assert.deepStrictEqual(emergencyContact, {
        ...emergencyContact,
        id: emergencyContact.id,
        firstName: 'Smith',
        middleName: null,
        lastName: 'Doe',
        email: null,
        phone: null,
        relationship: 'PARENT',
      });
    });

    it('should not create a contact if all fields are empty strings and relationship is null', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          contactData: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            relationship: null,
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { emergencyContact } = JSON.parse(reply.body);
      assert.deepStrictEqual(emergencyContact, {});
    });

    it('should disconnect an existing contact if all fields are empty strings and relationship is null', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          contactData: {
            firstName: 'newName',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            relationship: null,
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { emergencyContact } = JSON.parse(reply.body);
      assert.deepStrictEqual(emergencyContact, {
        ...emergencyContact,
        id: emergencyContact.id,
        firstName: 'newName',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: '',
      });

      reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          contactData: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            relationship: null,
          },
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { emergencyContact: updatedContact } = JSON.parse(reply.body);
      assert.deepStrictEqual(updatedContact, {});
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

    it('should allow hospital and PCP of a patient be removed', async (t) => {
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
            hospitalId: '',
            physicianId: '',
          },
        })
        .headers(headers);

      reply = await app
        .inject()
        .get('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);

      hospital = JSON.parse(reply.body).hospital;
      physician = JSON.parse(reply.body).physician;

      assert.deepStrictEqual(hospital, null);
      assert.deepStrictEqual(physician, null);
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

    it('should allow ADMIN to update a patient with code status', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .patch('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .payload({
          codeStatus: 'DNR',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const { id, firstName, middleName, lastName, dateOfBirth, codeStatus } =
        JSON.parse(reply.body);

      assert.deepStrictEqual(id, '27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(firstName, 'John');
      assert.deepStrictEqual(middleName, 'A');
      assert.deepStrictEqual(lastName, 'Doe');
      assert.deepStrictEqual(dateOfBirth, '2000-10-05');
      assert.deepStrictEqual(codeStatus, 'DNR');
    });
  });

  describe('DELETE /:id', () => {
    it('should return an error if not an ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      let reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064');
      assert.deepStrictEqual(reply.statusCode, StatusCodes.UNAUTHORIZED);

      let headers = await t.authenticate('first.responder@test.com', 'test');
      reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('staff.user@test.com', 'test');
      reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);

      headers = await t.authenticate('volunteer.user@test.com', 'test');
      reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should allow ADMIN to delete a patient', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe54671064')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(result, {
        message: 'Patient deleted successfully',
      });
    });

    it('should throw an error if a patient does not exist', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .delete('/api/v1/patients/27963f68-ebc1-408a-8bb5-8fbe5467106a')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
      const result = JSON.parse(reply.body);
      assert.deepStrictEqual(
        result.message,
        'Patient with ID 27963f68-ebc1-408a-8bb5-8fbe5467106a does not exist in database.',
      );
    });
  });
});
