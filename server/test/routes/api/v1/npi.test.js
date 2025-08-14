import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';

import { build } from '#test/helper.js';

const registryHost = 'https://npiregistry.cms.hhs.gov';

describe('/api/v1/npi', () => {
  describe('GET /', () => {
    it('should return organizations from NPI registry', async (t) => {
      const scope = nock(registryHost)
        .get('/api/')
        .query({
          version: '2.1',
          enumeration_type: 'NPI-2',
          organization_name: 'Kaiser',
          state: 'CA'
        })
        .reply(200, {
          results: [
            {
              number: 1234567890,
              basic: { organization_name: 'Kaiser Permanente' },
              addresses: [
                {
                  address_purpose: 'LOCATION',
                  address_1: '123 Main St',
                  address_2: 'Ste 100',
                  city: 'San Francisco',
                  state: 'CA',
                  postal_code: '94103',
                  telephone_number: '555-123-4567'
                }
              ]
            }
          ]
        });

      const app = await build(t);
      const res = await app.inject().get('/api/v1/npi?name=Kaiser&state=CA');
      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.body), [
        {
          name: 'Kaiser Permanente',
          address: '123 Main St Ste 100, San Francisco, CA 94103',
          phone: '555-123-4567',
          npi: '1234567890'
        }
      ]);
      scope.done();
    });

    it('should return BAD_GATEWAY when registry fails', async (t) => {
      const scope = nock(registryHost)
        .get('/api/')
        .query({
          version: '2.1',
          enumeration_type: 'NPI-2',
          organization_name: 'Kaiser',
          state: 'CA'
        })
        .reply(500, {});

      const app = await build(t);
      const res = await app.inject().get('/api/v1/npi?name=Kaiser&state=CA');
      assert.deepStrictEqual(res.statusCode, StatusCodes.BAD_GATEWAY);
      const body = JSON.parse(res.body);
      assert.deepStrictEqual(body.message, 'Failed to fetch NPI registry');
      scope.done();
    });

    it('should handle network errors gracefully', async (t) => {
      const scope = nock(registryHost)
        .get('/api/')
        .query({
          version: '2.1',
          enumeration_type: 'NPI-2',
          organization_name: 'Kaiser',
          state: 'CA'
        })
        .replyWithError('network error');

      const app = await build(t);
      const res = await app.inject().get('/api/v1/npi?name=Kaiser&state=CA');
      assert.deepStrictEqual(res.statusCode, StatusCodes.INTERNAL_SERVER_ERROR);
      const body = JSON.parse(res.body);
      assert.deepStrictEqual(body.message, 'Error fetching NPI data');
      scope.done();
    });
  });
});