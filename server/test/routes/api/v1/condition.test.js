import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';
import { StatusCodes } from 'http-status-codes';

describe('/api/v1/conditions', () => {
  describe('GET /', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=diabetes');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Diabetes Type I' }, { name: 'Diabetes Type II' }]);
    });

    it('should return no query message when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No query provided' });
    });

    it('should return no results from database message for an unknown condition', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=newcondition');

      assert.deepStrictEqual(res.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return no known conditions for n/a', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/conditions?condition=n/a');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: "No known conditions" });
    });

  });
});
