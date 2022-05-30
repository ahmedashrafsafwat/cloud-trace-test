import test from 'ava';
import convertToFloat from './convertToFloat';

test('Convert strings an numbers', (t) => {
  t.is(convertToFloat('1.0'), 1);
  t.is(convertToFloat(1), 1);
  t.is(convertToFloat('a'), NaN);
});

test('Convert array of strings and numbers', (t) => {
  t.deepEqual(convertToFloat(['a', '2.01', 2]), [NaN, 2.01, 2]);
});
