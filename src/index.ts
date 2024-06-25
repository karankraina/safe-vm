export function createContext() {
  return {};
}

export function runInContext(code: string): unknown {
  console.log(`Running Code: `, code);
  return true;
}
