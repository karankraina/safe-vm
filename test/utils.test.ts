import { test } from 'tap';
import { arrayDifference } from '../src/utils';

test('should return difference of arrays', (t) => {
  const array1 = ['value1', 'value2'];
  const array2 = ['value1'];

  const difference = arrayDifference(array1, array2);

  t.equal(difference.length, 1);
  t.end();
});
