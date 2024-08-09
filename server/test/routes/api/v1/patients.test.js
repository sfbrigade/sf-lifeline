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
});
