import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';

describe('/api/v1/conditions', () => {
  describe('GET /', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=diabetes');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Diabetes Type I' }, { name: 'Diabetes Type II' }]);
    });

    it('should return no query message when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No query provided' });
    });

    it('should return no results from database message for an unknown condition', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=newcondition');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No results found in the database' });
    });

    it('should return no known conditions for n/a', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=n/a');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), { name: "No known conditions" });
    });

  });
});
