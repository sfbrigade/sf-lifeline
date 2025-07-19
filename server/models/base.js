import { z } from 'zod';

class Base {
  static PhoneSchema = z.string().regex(/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/, 'Phone number must be in format (###) ###-####').nullable().optional();

  constructor (fields, data) {
    if (!data) {
      return null;
    }
    this._data = data;
    return new Proxy(this, {
      get (target, property, receiver) {
        // if the property is in the schema, return it from the data object
        if (Object.hasOwn(fields, property)) {
          return data[property];
        }
        // otherwise, dispatch it to the target with the proxy as this
        const { get, value } =
          Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(target),
            property
          ) ?? {};
        // handle property accessor
        if (get) {
          return get.call(receiver);
        }
        // handle function
        if (value) {
          return value.bind(receiver);
        }
        // otherwise, return value directly off of target
        return target[property];
      },
      set (target, property, value, receiver) {
        // if the property is in the schema, set it in the data object
        if (Object.hasOwn(fields, property)) {
          data[property] = value;
          return true;
        }
        // otherwise, set on target with proxy as this
        const descriptor =
          Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(target),
            property
          ) ?? {};
        const { set } = descriptor;
        if (set) {
          set.call(receiver, value);
          return true;
        }
        target[property] = value;
        return true;
      },
    });
  }
}
export default Base;
