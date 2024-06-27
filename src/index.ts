import { Context, RunningCodeOptions, runInContext } from 'node:vm';
import { createContextWithNodeRealm } from './context';

export interface RunningSafeCodeOptions extends RunningCodeOptions {
  env?: boolean;
}

export function runInSafeContext(
  code: string,
  sandbox: Context = {},
  options?: string | RunningSafeCodeOptions,
): unknown {
  const context = createContextWithNodeRealm(sandbox);

  return runInContext(code, context, options);
}
