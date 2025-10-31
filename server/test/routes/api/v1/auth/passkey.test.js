import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '#test/helper.js';

describe('/api/v1/auth/passkey', () => {
  describe('GET /options', () => {
    it('should return not found for user that does not exist', async (t) => {
      const app = await build(t);
      const response = await app
        .inject()
        .get('/api/v1/auth/passkey/options')
        .query({ id: '00000000-0000-0000-0000-000000000000' });

      assert.deepStrictEqual(response.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return registration options for valid user', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const user = await t.prisma.user.findUnique({
        where: { email: 'admin.user@test.com' },
      });

      const response = await app
        .inject()
        .get('/api/v1/auth/passkey/options')
        .query({ id: user.id });

      assert.deepStrictEqual(response.statusCode, StatusCodes.OK);

      const body = JSON.parse(response.body);
      assert.ok(body.challenge);
      assert.ok(body.rp);
      assert.ok(body.user);
      assert.ok(body.pubKeyCredParams);
      assert.ok(body.authenticatorSelection);

      // Verify options are stored in database
      const storedOption = await t.prisma.registrationOption.findUnique({
        where: { id: user.id },
      });
      assert.ok(storedOption);
      assert.ok(storedOption.expiresAt > new Date());
    });

    it('should exclude existing passkeys from registration options', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const user = await t.prisma.user.findUnique({
        where: { email: 'admin.user@test.com' },
      });

      // User should have a passkey from fixtures
      const passkeys = await t.prisma.passkey.findMany({
        where: { internalUserId: user.id },
      });
      assert.ok(passkeys.length > 0);

      const response = await app
        .inject()
        .get('/api/v1/auth/passkey/options')
        .query({ id: user.id });

      assert.deepStrictEqual(response.statusCode, StatusCodes.OK);
      const body = JSON.parse(response.body);
      assert.ok(body.excludeCredentials);
      assert.ok(body.excludeCredentials.length > 0);
    });
  });

  describe('GET /authOptions', () => {
    it('should return authentication options', async (t) => {
      const app = await build(t);

      const response = await app
        .inject()
        .get('/api/v1/auth/passkey/authOptions');

      assert.deepStrictEqual(response.statusCode, StatusCodes.OK);

      const body = JSON.parse(response.body);
      assert.ok(body.challenge);
      // rp is optional in authentication options, check for rpId or rp
      assert.ok(body.rpId || body.rp);

      // Verify options are stored in database
      const storedOption = await t.prisma.authenticationOption.findUnique({
        where: { challenge: body.challenge },
      });
      assert.ok(storedOption);
      assert.ok(storedOption.expiresAt > new Date());
    });
  });

  describe('POST /verify-registration/:id', () => {
    it('should return bad request when registration options not found', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const user = await t.prisma.user.findUnique({
        where: { email: 'volunteer.user@test.com' },
      });

      const response = await app
        .inject()
        .post(`/api/v1/auth/passkey/verify-registration/${user.id}`)
        .payload({
          id: 'test-id',
          rawId: 'test-raw-id',
          response: {
            attestationObject: 'test-attestation',
            clientDataJSON: 'test-client-data',
          },
          type: 'public-key',
        });

      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(
        body.message,
        'Registration options not found or expired'
      );
    });

    it('should return bad request when registration options expired', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const user = await t.prisma.user.findUnique({
        where: { email: 'volunteer.user@test.com' },
      });

      // Create expired registration option
      const expiredDate = new Date(Date.now() - 60000); // 1 minute ago
      await t.prisma.registrationOption.create({
        data: {
          id: user.id,
          options: { challenge: 'test-challenge' },
          expiresAt: expiredDate,
        },
      });

      const response = await app
        .inject()
        .post(`/api/v1/auth/passkey/verify-registration/${user.id}`)
        .payload({
          id: 'test-id',
          rawId: 'test-raw-id',
          response: {
            attestationObject: 'test-attestation',
            clientDataJSON: 'test-client-data',
          },
          type: 'public-key',
        });

      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(
        body.message,
        'Registration options not found or expired'
      );
    });

    it('should return unprocessable entity for invalid verification response', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const user = await t.prisma.user.findUnique({
        where: { email: 'volunteer.user@test.com' },
      });

      // Create valid registration option
      const futureDate = new Date(Date.now() + 300000); // 5 minutes from now
      await t.prisma.registrationOption.create({
        data: {
          id: user.id,
          options: {
            challenge: 'test-challenge-123',
            rp: { name: 'Test', id: 'test.com' },
            user: { id: 'test', name: 'test@test.com', displayName: 'Test User' },
          },
          expiresAt: futureDate,
        },
      });

      const response = await app
        .inject()
        .post(`/api/v1/auth/passkey/verify-registration/${user.id}`)
        .payload({
          id: 'test-id',
          rawId: 'test-raw-id',
          response: {
            attestationObject: 'invalid-attestation',
            clientDataJSON: 'invalid-client-data',
          },
          type: 'public-key',
        });

      // Should fail verification (either BAD_REQUEST or UNPROCESSABLE_ENTITY)
      assert.ok(
        response.statusCode === StatusCodes.BAD_REQUEST ||
          response.statusCode === StatusCodes.UNPROCESSABLE_ENTITY
      );
    });
  });

  describe('POST /authVerify', () => {
    it('should return bad request when authentication options not found', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const response = await app.inject().post('/api/v1/auth/passkey/authVerify').payload({
        challenge: 'non-existent-challenge',
        id: 'test-passkey-id-1',
        rawId: 'test-raw-id',
        response: {
          authenticatorData: 'test-auth-data',
          clientDataJSON: 'test-client-data',
          signature: 'test-signature',
        },
        type: 'public-key',
      });

      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(
        body.message,
        'Authentication options not found or expired'
      );
    });

    it('should return bad request when passkey not found', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      // Create valid authentication option
      const futureDate = new Date(Date.now() + 300000);
      await t.prisma.authenticationOption.create({
        data: {
          challenge: 'test-challenge-456',
          options: {
            challenge: 'test-challenge-456',
            rp: { name: 'Test', id: 'test.com' },
          },
          expiresAt: futureDate,
        },
      });

      const response = await app.inject().post('/api/v1/auth/passkey/authVerify').payload({
        challenge: 'test-challenge-456',
        id: 'non-existent-passkey-id',
        rawId: 'test-raw-id',
        response: {
          authenticatorData: 'test-auth-data',
          clientDataJSON: 'test-client-data',
          signature: 'test-signature',
        },
        type: 'public-key',
      });

      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(body.message, 'Passkey not found');
    });

    it('should return bad request when authentication options expired', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      // Create expired authentication option
      const expiredDate = new Date(Date.now() - 60000);
      await t.prisma.authenticationOption.create({
        data: {
          challenge: 'expired-challenge',
          options: {
            challenge: 'expired-challenge',
            rp: { name: 'Test', id: 'test.com' },
          },
          expiresAt: expiredDate,
        },
      });

      const response = await app.inject().post('/api/v1/auth/passkey/authVerify').payload({
        challenge: 'expired-challenge',
        id: 'test-passkey-id-1',
        rawId: 'test-raw-id',
        response: {
          authenticatorData: 'test-auth-data',
          clientDataJSON: 'test-client-data',
          signature: 'test-signature',
        },
        type: 'public-key',
      });

      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(
        body.message,
        'Authentication options not found or expired'
      );
    });

    it('should return bad request for invalid authentication response', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      // Create valid authentication option
      const futureDate = new Date(Date.now() + 300000);
      await t.prisma.authenticationOption.create({
        data: {
          challenge: 'valid-challenge',
          options: {
            challenge: 'valid-challenge',
            rp: { name: 'Test', id: process.env.WEB_AUTHN_RP_ID || 'localhost' },
          },
          expiresAt: futureDate,
        },
      });

      const response = await app.inject().post('/api/v1/auth/passkey/authVerify').payload({
        challenge: 'valid-challenge',
        id: 'test-passkey-id-1',
        rawId: 'test-raw-id',
        response: {
          authenticatorData: 'invalid-auth-data',
          clientDataJSON: 'invalid-client-data',
          signature: 'invalid-signature',
        },
        type: 'public-key',
      });

      // Should fail verification (invalid data causes verification to throw error)
      assert.deepStrictEqual(response.statusCode, StatusCodes.BAD_REQUEST);
      const body = JSON.parse(response.body);
      assert.deepStrictEqual(body.message, 'Authentication verification failed');
    });
  });
});
