import { test } from 'tap';

import { createContext, runInContext } from '../src/index';

test('should return an empty context', (t) => {
  const context = createContext();
  t.same(context, {});
  t.end();
});

test('should return true', (t) => {
  const context = runInContext('code');

  t.equal(context, true);
  t.end();
});
