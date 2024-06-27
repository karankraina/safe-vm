export function arrayDifference(arr1: string[], arr2: string[]) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return [];
  }

  return arr1.filter((globalProp) => !arr2.includes(globalProp));
}
