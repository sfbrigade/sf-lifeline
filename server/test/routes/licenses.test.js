import { test } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../helper.js';


test('License API returns valid results', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/api/v1/licenses?license=P39332'
  });
  const { name, licenseNumber } = JSON.parse(res.payload);
  assert.equal(name, 'Koo, Chih Ren Nicholas');
  assert.equal(licenseNumber, 'P39332');
})

test('License API returns error for no matching results', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/api/v1/licenses?license=1'
  });
  const { message } = JSON.parse(res.body);
  assert.equal(res.statusCode, 500);
  assert.equal(message, 'No match.');
})
