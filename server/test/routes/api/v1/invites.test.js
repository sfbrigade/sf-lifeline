import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';

describe('/api/v1/invites', () => {
  describe('GET /', () => {
    it('should return a paginated list of Invite records', async (t) => {
      const app = await build(t);
      await t.loadFixtures();
      const res = await app.inject().get('/api/v1/invites');
      assert.deepStrictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.deepStrictEqual(data.length, 3);
    });
  });
});
