import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '#test/helper.js';

describe('/api/v1/hospitals', () => {
  describe('GET /', () => {
    it('should return all hospitals for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=&perPage=1')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(
        reply.headers['link'],
        '<http://localhost/api/v1/hospitals?hospital=&perPage=1&page=2>; rel="next",<http://localhost/api/v1/hospitals?hospital=&perPage=1&page=4>; rel="last"'
      );
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 1);
    });

    it('should return hospitals for STAFF user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('staff.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 4);
    });

    it('should return hospitals for VOLUNTEER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('volunteer.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 4);
    });

    it('should return no hospitals for FIRST_RESPONDER user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('first.responder@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.FORBIDDEN);
    });

    it('should return a hospitals for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=SF')
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(reply.payload).length, 2);
      assert.deepStrictEqual(JSON.parse(reply.payload)[0].name, 'Kaiser SF');
      assert.deepStrictEqual(JSON.parse(reply.payload)[1].name, 'SF General');
    });
  });
  describe('GET /:id', () => {
    it('should return a single hospital for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a hospital ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=SF')
        .headers(headers);

      const hospitalId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .get(`/api/v1/hospitals/${hospitalId}`)
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const hospital = JSON.parse(reply.payload);
      assert.deepStrictEqual(hospital.name, 'Kaiser SF');
    });

    it('should return 404 for non-existent hospital', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/hospitals/b05a61d3-670e-4a49-b485-b225a7c3d6a9')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return all hospitals associated with physician', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .get('/api/v1/hospitals?physicianId=4f177289-f23a-47df-aa16-d9e54108daae')
        .headers(headers);

      const hospitals = JSON.parse(reply.payload);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(hospitals.length, 2);
      assert.deepStrictEqual(hospitals[0].id, 'b50538cd-1e10-42a3-8d6b-f9ae1e48a025');
      assert.deepStrictEqual(hospitals[0].name, 'Kaiser SF');
      assert.deepStrictEqual(hospitals[1].id, 'c50538cd-1e10-42a3-8d6b-f9ae1e48a025');
      assert.deepStrictEqual(hospitals[1].name, 'SF General');
    });
  });

  describe('POST /', () => {
    it('should create a new hospital for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/hospitals')
        .payload({
          name: 'New Hospital',
          address: '123 Main St',
          phone: '(415) 555-1234',
          email: 'contact@newhospital.com'
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.CREATED);
      const hospital = JSON.parse(reply.payload);
      assert.deepStrictEqual(hospital.name, 'New Hospital');
      assert.deepStrictEqual(hospital.address, '123 Main St');
      assert.deepStrictEqual(hospital.phone, '(415) 555-1234');
      assert.deepStrictEqual(hospital.email, 'contact@newhospital.com');
    });

    it('should error for incorrect phone or email format', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      let reply = await app
        .inject()
        .post('/api/v1/hospitals')
        .payload({
          name: 'New Hospital',
          address: '123 Main St',
          phone: '(555)-555-5555',
          email: 'contact@newhospital.com'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);

      reply = await app
        .inject()
        .post('/api/v1/hospitals')
        .payload({
          name: 'New Hospital',
          address: '123 Main St',
          phone: '555-555-5555',
          email: 'contact@'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
    });

    it('should error if hospital already exists', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .post('/api/v1/hospitals')
        .payload({
          name: 'Kaiser SF',
          address: '456 Main Street',
          phone: '(123) 456-9999',
          email: 'kaiser.sf@test.com'
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(
        JSON.parse(reply.payload).message,
        'Hospital with name Kaiser SF and address Kaiser SF and phone (123) 456-9999 and email kaiser.sf@test.com already exists.'
      );
    });
  });

  describe('PATCH /:id', () => {
    it('should update a hospital for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a hospital ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=SF')
        .headers(headers);

      const hospitalId = JSON.parse(listReply.payload)[0].id;
      const reply = await app
        .inject()
        .patch(`/api/v1/hospitals/${hospitalId}`)
        .payload({
          name: 'Kaiser SF Updated',
          address: '456 New St',
          phone: '(415) 555-1234',
          email: 'newcontact@kaiser.com'
        })
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      const hospital = JSON.parse(reply.payload);
      assert.deepStrictEqual(hospital.name, 'Kaiser SF Updated');
      assert.deepStrictEqual(hospital.address, '456 New St');
      assert.deepStrictEqual(hospital.phone, '(415) 555-1234');
      assert.deepStrictEqual(hospital.email, 'newcontact@kaiser.com');
    });

    it('should return 404 for updating non-existent hospital', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      const reply = await app
        .inject()
        .patch('/api/v1/hospitals/b05a61d3-670e-4a49-b485-b225a7c3d6a9')
        .payload({
          name: 'Kaiser SF Updated',
          address: '456 New St',
          phone: '(415) 555-1234',
          email: 'newcontact@kaiser.com'
        })
        .headers(headers);

      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a hospital for ADMIN user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');

      // First get a hospital ID from the list
      const listReply = await app
        .inject()
        .get('/api/v1/hospitals?hospital=Bob')
        .headers(headers);

      const hospitalId = JSON.parse(listReply.payload)[0].id;

      const reply = await app
        .inject()
        .delete(`/api/v1/hospitals/${hospitalId}`)
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.OK);
      // Verify the hospital is deleted
      const getReply = await app
        .inject()
        .get(`/api/v1/hospitals/${hospitalId}`)
        .headers(headers);

      assert.deepStrictEqual(getReply.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return 404 for deleting non-existent hospital', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const headers = await t.authenticate('admin.user@test.com', 'test');
      const reply = await app
        .inject()
        .delete('/api/v1/hospitals/8dac39e4-21dd-4b68-9f0a-d46676bc5a20')
        .headers(headers);
      assert.deepStrictEqual(reply.statusCode, StatusCodes.NOT_FOUND);
    });
  });
});
