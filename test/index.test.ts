import { test } from 'tap';
import { createContext, runInContext } from 'vm';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { runInSafeContext } from '../src/index';
import { arrayDifference } from '../src/utils';

test('should eval a code string', (t) => {
  const context = runInSafeContext('let a=10; a');

  t.equal(context, 10);
  t.end();
});

async function fixtures(directoryName: string) {
  const fixturePath = path.resolve(
    process.cwd(),
    'test/fixtures',
    directoryName,
  );
  const files = await readdir(fixturePath);
  const codes = await Promise.all(
    files.map((file) =>
      readFile(path.join(fixturePath, file), { encoding: 'utf-8' }),
    ),
  );
  return codes;
}

test('should execute code safely - no properties added to globalThis', async (t) => {
  const codesToExecute = await fixtures('new-properties');
  const globalBuiltInsBefore = Object.getOwnPropertyNames(globalThis);
  codesToExecute.forEach((code) => {
    let errorCaptured;
    try {
      runInSafeContext(code);
      const globalBuiltInsAfter = Object.getOwnPropertyNames(globalThis);
      t.equal(globalBuiltInsBefore.length, globalBuiltInsAfter.length);
    } catch (error) {
      errorCaptured = error;
    }

    t.same(errorCaptured, undefined);
  });
});

test('should execute the given in a sandboxed env providing all Node.JS builtins', (t) => {
  const globalBuiltIns = Object.getOwnPropertyNames(globalThis);
  const ctx = createContext({});
  const contextifiedGlobal = runInContext(
    'Object.getOwnPropertyNames(globalThis)',
    ctx,
  );
  const missingBuiltIns = arrayDifference(globalBuiltIns, contextifiedGlobal);

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
  const context = runInSafeContext(code);

  t.equal(context, true);
  t.end();
});

test('should restrict code to extend globalThis', (t) => {
  const code = `
    Object.assign(globalThis, {window: { document: {} } });
    globalThis.window;
    `;
  const context = runInSafeContext(code);

  t.same(context, { document: {} });
  t.same(globalThis.window, undefined);
  t.end();
});

test('should restrict code to patch global modules', (t) => {
  const code = `
      Object.assign(globalThis, {fetch: 'updated_fetch' });
      globalThis.fetch;
      `;
  const context = runInSafeContext(code);

  t.equal(context, 'updated_fetch');
  t.not(globalThis.fetch, 'updated_fetch');
  t.end();
});

test('should restrict code to delete or add properties to global modules', (t) => {
  const code = `
        delete globalThis.fetch
        globalThis.patched = true;
        globalThis.fetch;
        `;
  const context = runInSafeContext(code);

  t.equal(context, undefined);
  t.not(globalThis.fetch, 'updated_fetch');
  t.equal(globalThis.patched, undefined);
  t.end();
});

test('should restrict code to call exit from process module', (t) => {
  const code = `
          process.exit(1);
          `;
  try {
    runInSafeContext(code);
  } catch (error) {
    t.equal(error.message, 'process.exit is not a function');
  }

  t.end();
});
