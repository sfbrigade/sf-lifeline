import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../helper.js';

describe('Testing License API route', () => {
  it('should return valid results', async (t) => {
    const app = await build(t);

    const validLicense = {
      name: "Koo, Chih Ren Nicholas",
      licenseType: "Paramedic",
      status: "Active",
      licenseNumber: "P39332"
    }

    const res = await app.inject({
      url: '/api/v1/licenses?license=P39332'
    });
    assert.deepStrictEqual(JSON.parse(res.payload), validLicense)

  });

  it('should return a 404 error for no matching results', async (t) => {
    const app = await build(t);

    const res = await app.inject({
      url: '/api/v1/licenses?license=1'
    });
    const { message } = JSON.parse(res.body);
    assert.equal(res.statusCode, 404);
    assert.equal(message, 'No match.');
  });
});