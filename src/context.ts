import { Context, createContext, runInContext } from 'node:vm';
import { arrayDifference } from './utils';

const globalBuiltIns = Object.getOwnPropertyNames(globalThis);

const ctx = createContext({});
const contextifiedGlobal = runInContext(
  'Object.getOwnPropertyNames(globalThis)',
  ctx,
);

const missingBuiltIns = arrayDifference(globalBuiltIns, contextifiedGlobal);

function createProxyForBuiltIn(obj: PropertyDescriptor) {
  if (obj.get) {
    const targetObj = obj.get();
    const val = new Proxy(targetObj, {
      get(target, prop) {
        return target[prop.toString()];
      },
      set() {
        return false;
      },
    });

    return {
      ...obj,
      get: () => val,
      set: () => {},
    };
  }
  const targetObj = obj.value;

  if (['string', 'boolean', 'symbol'].includes(typeof targetObj)) {
    return obj;
  }
  return {
    ...obj,
    value: new Proxy(targetObj, {
      get(target, prop) {
        return target[prop.toString()];
      },
      set() {
        return false;
      },
    }),
  };
}

function provideBuiltIn(name: string) {
  let builtIn: PropertyDescriptor = {};

  if (name === 'process') {
    builtIn.value = {
      version: process.version,
      versions: process.versions,
      env: {
        NODE_ENV: 'production',
      },
    };
    return builtIn;
  }

  if (name === 'crypto') {
    builtIn.value = {};
    return builtIn;
  }

  builtIn = Object.getOwnPropertyDescriptor(globalThis, name) || builtIn;

  builtIn = createProxyForBuiltIn(builtIn);
  return builtIn;
}

export function createContextWithNodeRealm(sandbox: Context) {
  const context = createContext(sandbox);

  missingBuiltIns.forEach((name) => {
    const builtIn = provideBuiltIn(name);
    Object.defineProperty(context, name, builtIn);
  });

  return context;
}
