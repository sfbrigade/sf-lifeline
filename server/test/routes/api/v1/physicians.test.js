import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '#test/helper.js';

describe('/api/v1/physicians', () => {
  describe('GET /', () => {
    it('should return all physicians for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/physicians?physician=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/physicians?physician=&perPage=1&page=4>; rel="last"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
    });

    it('should return physicians for STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 4);
    });

    it('should return physicians for VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 4);
    });

    it('should return no physicians for FIRST_RESPONDER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('first.responder@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return a physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 2);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'Bob');
      assert.deepStrictEqual(JSON.parse(reply.payload)[1].firstName, 'John');
    });

    it('should return a physician from querying for their first, last, and full name', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?physician=john')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].firstName, 'John');

      const reply2 = await app
        .inject()
        .get('/api/v1/physicians?physician=john smith')
        .headers(headers);

      assert.deepStrictEqual(reply2.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply2.payload).length, 1);
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].firstName, 'John');
      assert.deepStrictEqual(JSON.parse(reply2.payload)[0].lastName, 'Smith');
    });
  });

  describe('GET /:id', () => {
    it('should return a single physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a physician ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      const physicianId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .get(`/api/v1/physicians/${physicianId}`)
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const physician = JSON.parse(reply.payload);
      assert.deepStrictEqual(physician.firstName, 'Bob');
      assert.deepStrictEqual(physician.lastName, 'Smith');
    });

    it('should return 404 for non-existent physician', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/physicians/d4db8be6-1c3b-41ba-8aae-4347b1caf389')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
    it('should return a single physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a physician ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      const physicianId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .get(`/api/v1/physicians/${physicianId}`)
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const physician = JSON.parse(reply.payload);
      assert.deepStrictEqual(physician.firstName, 'Bob');
      assert.deepStrictEqual(physician.lastName, 'Smith');
    });

    it('should return hospitals associated with physician', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/physicians?hospitalId=a50538cd-1e10-42a3-8d6b-f9ae1e48a025')
        .headers(headers);
      const physicians = JSON.parse(reply.payload);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(physicians.length, 2);
      assert.deepStrictEqual(physicians[0].id, '1ef50c4c-92cb-4298-ab0a-ce7644513bfb');
      assert.deepStrictEqual(physicians[1].id, 'bbbf7f99-36cc-40b5-a26c-cd95daae04b5');
    });
  });

  describe('POST /', () => {
    it('should create a new physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '(415) 555-5555',
          email: 'jane.doe@test.com',
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      assert.deepStrictEqual(JSON.parse(reply.payload).firstName, 'Jane');
      assert.deepStrictEqual(JSON.parse(reply.payload).lastName, 'Doe');
      assert.deepStrictEqual(JSON.parse(reply.payload).phone, '(415) 555-5555');
      assert.deepStrictEqual(
        JSON.parse(reply.payload).email,
        'jane.doe@test.com'
      );
    });

    it('should error for incorrect phone or email format', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '(555)-555-5555',
          email: 'jane.doe@test.com',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);

      reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '(555) 555-5555',
          email: 'jane.doe@',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
    });

    it('should error if physician already exists without registering new duplicate', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '(555) 555-5555',
          email: 'jane.doe@test.com',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);

      reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jackson',
          lastName: 'Washington',
          phone: '(555) 555-1111',
          email: 'jane.doe@test.com',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(
        JSON.parse(reply.payload).message,
        'Physician with email jane.doe@test.com already exists.'
      );

      reply = await app
        .inject()
        .post('/api/v1/physicians')
        .payload({
          firstName: 'Jackson',
          lastName: 'Washington',
          phone: '(555) 555-5555',
          email: 'jane.doe@test.com',
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(
        JSON.parse(reply.payload).message,
        'Physician with phone (555) 555-5555 and email jane.doe@test.com already exists.'
      );

      reply = await app
        .inject()
        .get('/api/v1/physicians?physician=jackson washington')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 0);
    });
  });

  describe('PATCH /:id', () => {
    it('should update a physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a physician ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      const physicianId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .patch(`/api/v1/physicians/${physicianId}`)
        .payload({
          firstName: 'Robert',
          lastName: 'Smith',
          phone: '(555) 555-1234',
          email: 'robert.smith@test.com'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const physician = JSON.parse(reply.payload);
      assert.deepStrictEqual(physician.firstName, 'Robert');
      assert.deepStrictEqual(physician.lastName, 'Smith');
      assert.deepStrictEqual(physician.phone, '(555) 555-1234');
      assert.deepStrictEqual(physician.email, 'robert.smith@test.com');
    });

    it('should return 404 for updating non-existent physician', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .put('/api/v1/physicians/999999')
        .payload({
          firstName: 'Robert',
          lastName: 'Smith',
          phone: '(555) 555-1234',
          email: 'robert.smith@test.com'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should validate phone and email format', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a physician ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/physicians?physician=smith')
        .headers(headers);

      const physicianId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .put(`/api/v1/physicians/${physicianId}`)
        .payload({
          firstName: 'Robert',
          lastName: 'Smith',
          phone: '(555)-555-1234',
          email: 'robert.smith@'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a physician for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a physician ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/physicians?physician=Beer')
        .headers(headers);

      const physicianId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .delete(`/api/v1/physicians/${physicianId}`)
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);

      // Verify the physician is deleted
      const getReply = await app
        .inject()
        .get(`/api/v1/physicians/${physicianId}`)
        .headers(headers);

      assert.deepStrictEqual(getReply.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return 404 for deleting non-existent physician', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .delete('/api/v1/physicians/969e36df-d98c-4c96-a854-1d8ed902e84b')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
  });
});
