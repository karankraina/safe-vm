import { test } from 'tap';

import { createContextWithNodeRealm } from '../src/context';
import { runInContext, runInNewContext } from 'vm';
import { arrayDifference } from '../src/utils';

test('should return a context', (t) => {
  const context = createContextWithNodeRealm({});

  t.not(context, undefined);
  t.not(context, null);
  t.end();
});

test('should return a context with all builtins present in Node.js', (t) => {
  const context = createContextWithNodeRealm({});

  // Get all builtin modules available in Node.js
  const globalBuiltIns = Object.getOwnPropertyNames(globalThis);

  // Get the list of modules available in a vm `Context`
  const sandboxContext = runInNewContext(
    'Object.getOwnPropertyNames(globalThis)',
  );

  const missingBuiltIns = arrayDifference(globalBuiltIns, sandboxContext);

  const getThrower = (name) => `
  if(!${name}) {
    throw new Error('Not found');
  }

  true;
  `;

  // This will throw if any of the missing built in is not available in sandbox
  const code = `
    ${missingBuiltIns.map((builtIn) => getThrower(builtIn)).join('\n')}
  `;

  const shouldNotThrow = runInContext(code, context);
  t.same(shouldNotThrow, true);
  t.end();
});
