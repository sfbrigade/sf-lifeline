import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../../helper.js';

describe('/api/v1/allergies', () => {
  describe('GET /', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/allergies?allergy=p');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), [{ name: 'Grass Pollen' }, { name: 'Pollen' }]);
    });

    it('should return nothing when no query provided', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/allergies?allergy=');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), []);
    });

    it('should return no known allergies for n/a', async (t) => {
      const app = await build(t);
      await t.loadFixtures();

      const res = await app.inject().get('/api/v1/allergies?allergy=n/a');

      assert.deepStrictEqual(res.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(res.payload), { name: "No known allergies" });
    });

  });
});
