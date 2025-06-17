import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import Base from '#models/base.js';

class Test extends Base {
  constructor (data) {
    super({ property0: 'property0' }, data);
    this.property1 = 'value1';
  }

  get property2 () {
    return this.property0 + this.property1;
  }

  set property2 (newValue) {
    const tokens = newValue.split(',');
    this.property0 = tokens[0];
    this.property1 = tokens[1];
  }

  function1 () {
    return `${this.property0} accessed through function 1`;
  }
}

describe('Base', () => {
  describe('get', () => {
    it('proxies an underlying scalar field in the schema', () => {
      const test = new Test({ property0: 'value0' });
      assert.deepStrictEqual(test.property0, 'value0');
    });

    it('gets a normal property', () => {
      const test = new Test({ property0: 'value0' });
      assert.deepStrictEqual(test.property1, 'value1');
    });

    it('binds getters to the proxy so they can access proxied scalar fields', () => {
      const test = new Test({ property0: 'value0' });
      assert.deepStrictEqual(test.property2, 'value0value1');
    });

    it('binds functions to the proxy so they can access proxied scalar fields', () => {
      const test = new Test({ property0: 'value0' });
      assert.deepStrictEqual(
        test.function1(),
        'value0 accessed through function 1'
      );
    });
  });

  describe('set', () => {
    it('proxies to the underlying scalar field in the schema', () => {
      const data = { property0: 'value0' };
      const test = new Test(data);
      test.property0 = 'newvalue0';
      assert.deepStrictEqual(data.property0, 'newvalue0');
    });

    it('sets a normal property', () => {
      const test = new Test({ property0: 'value0' });
      test.property1 = 'newvalue1';
      assert.deepStrictEqual(test.property1, 'newvalue1');
    });

    it('binds setters to the proxy so they can set proxied scalar fields', () => {
      const data = { property0: 'value0' };
      const test = new Test(data);
      test.property2 = 'newvalue0,newvalue1';
      assert.deepStrictEqual(data.property0, 'newvalue0');
      assert.deepStrictEqual(test.property1, 'newvalue1');
    });
  });
});
