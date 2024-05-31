import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import nock from 'nock';

import { build } from '../../../helper.js';
import nockLicenseVerificationWebsite from '../../../fixtures/network/nockLicenseVerificationWebsite.js';
import { EMS_VERIFICATION_WEBSITE } from '../../../../helpers/license/verifyLicense.js';

describe('/api/v1/licenses', () => {
  describe('GET /', () => {
    beforeEach(async () => {
      // check if the website is up, if so, test against live website, otherwise mock
      let isLive;
      try {
        const res = await fetch(EMS_VERIFICATION_WEBSITE);
        isLive = res.status == 200;
      } catch {
        isLive = false;
      }
      if (isLive) {
        console.log(`TESTING AGAINST LIVE ${EMS_VERIFICATION_WEBSITE}`);
      } else {
        console.log(`Mocking ${EMS_VERIFICATION_WEBSITE}`);
        nock.cleanAll();
        nockLicenseVerificationWebsite();
      }
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
      assert.equal(message, 'No license match');
    });
  });
});
