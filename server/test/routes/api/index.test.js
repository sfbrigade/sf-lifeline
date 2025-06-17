import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '#test/helper.js';

describe('/api', () => {
  describe('GET /health', () => {
    it('returns ok when the server is up and running', async (t) => {
      const app = await build(t);

      const res = await app.inject({
        url: '/api/health',
      });
      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { status: 'OK' });
    });
  });
});
