import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import nock from 'nock';

import { build } from '../../../helper.js';
import nockLicenseVerificationWebsite from '../../../fixtures/network/nockLicenseVerificationWebsite.js';

describe('/api/v1/licenses', () => {
  describe('GET /', () => {
    beforeEach(() => {
      nock.cleanAll();
      nockLicenseVerificationWebsite();
    });

    it('should return valid results', async (t) => {
      const app = await build(t);

      const validLicense = {
        name: 'Koo, Chih Ren Nicholas',
        licenseType: 'Paramedic',
        status: 'Active',
        licenseNumber: 'P39332',
      };

      const res = await app.inject({
        url: '/api/v1/licenses?license=P39332',
      });
      assert.deepStrictEqual(JSON.parse(res.payload), validLicense);
    });

    it('should return a 404 error for no matching results', async (t) => {
      const app = await build(t);

      const res = await app.inject({
        url: '/api/v1/licenses?license=1',
      });
      const { message } = JSON.parse(res.body);
      assert.equal(res.statusCode, 404);
      assert.equal(message, 'No match.');
    });
  });
});
