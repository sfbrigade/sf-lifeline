import { beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert';
import nock from 'nock';

import { build } from '#test/helper.js';
import nockLicenseVerificationWebsite from '#test/fixtures/network/nockLicenseVerificationWebsite.js';
import { EMS_VERIFICATION_WEBSITE } from '#helpers/license/verifyLicense.js';

describe('/api/v1/licenses', () => {
  describe('GET /', () => {
    beforeEach(async () => {
      // In CI, always mock to avoid flakiness hitting the live site.
      // Locally, opt-in to live testing by setting USE_LIVE_LICENSE_TEST=1.
      const forceMock = process.env.CI || process.env.USE_LIVE_LICENSE_TEST !== '1';
      if (forceMock) {
        console.log(`Mocking ${EMS_VERIFICATION_WEBSITE}`);
        nock.cleanAll();
        nockLicenseVerificationWebsite();
        return;
      }

      // Otherwise, check if the website appears up and use live; fallback to mock.
      let isLive = false;
      try {
        const res = await fetch(EMS_VERIFICATION_WEBSITE);
        isLive = res.status === 200;
      } catch {}
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

    it('should return 422 error for already registered license', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject({
        url: '/api/v1/licenses?license=E148420',
      });
      const { message } = JSON.parse(res.body);
      assert.equal(res.statusCode, 422);
      assert.equal(message, 'License already registered');
    });
  });
});
