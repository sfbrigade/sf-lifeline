import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { StatusCodes } from 'http-status-codes';

import { build } from '../../../helper.js';

describe('/api/v1/auth', () => {
  describe('POST /login', () => {
    it('should return not found for email that is not registered', async (t) => {
      const app = await build(t);
      const response = await app.inject().post('/api/v1/auth/login').payload({
        email: 'not.found@gmail.com',
        password: 'test',
      });
      assert.deepStrictEqual(response.statusCode, StatusCodes.NOT_FOUND);
    });
  });
});
