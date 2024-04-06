import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';

describe('/api/v1/medications', () => {
  describe('GET /', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/medications?medication=ibuprofen');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'acetaminophen / ibuprofen' }, { name: 'ibuprofen 125 MG' }]);
    });

    it('should return no query message when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/medications?medication=');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: 'No query provided' });
    });

    it('should return no results from database message for an unknown medication', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/medications?medication=newmedication');

      assert.deepStrictEqual(res.statusCode, StatusCodes.NOT_FOUND);
    });

    it('should return no known medications for n/a', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/medications?medication=n/a');

      assert.deepStrictEqual(res.statusCode, StatusCodes.OK);
      assert.deepStrictEqual(JSON.parse(res.payload), { message: "No known medications" });
    });

  });
});
