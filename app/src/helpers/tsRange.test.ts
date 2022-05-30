import test from 'ava';
import TsRange from './tsRange';

test('Creating invalid TsRange', (t) => {
  // Empty pattern
  t.throws(() => new TsRange(''));

  // Invalid string
  t.throws(() => new TsRange('{}'));

  // Invalid bound marks
  t.throws(() => new TsRange('{"2020-01-01 00:00:00","2020-07-01 00:00:00"}'));

  // Invalid order of bounds
  t.throws(() => new TsRange('["2030-01-01 00:00:00","2020-07-01 00:00:00"]'));
});

test('Check if TsRange is concluding correct bounds', (t) => {
  // Lower and upper bounds are inclusive
  {
    const range = new TsRange('["2020-01-01 00:00:00","2020-07-01 00:00:00"]');
    t.is(range.lowerBoundInclusive, true);
    t.is(range.upperBoundInclusive, true);
    t.is(range.withinRange(new Date('2019-12-31 23:59:59')), false);
    t.is(range.withinRange(new Date('2020-01-01 00:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-01 01:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-30 23:59:59')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:00')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:01')), false);
  }

  // Only lower bound is inclusive
  {
    const range = new TsRange('["2020-01-01 00:00:00","2020-07-01 00:00:00")');
    t.is(range.lowerBoundInclusive, true);
    t.is(range.upperBoundInclusive, false);
    t.is(range.withinRange(new Date('2019-12-31 23:59:59')), false);
    t.is(range.withinRange(new Date('2020-01-01 00:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-01 01:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-30 23:59:59')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:00')), false);
    t.is(range.withinRange(new Date('2020-07-01 00:00:01')), false);
  }

  // Only upper bound is inclusive
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00"]');
    t.is(range.lowerBoundInclusive, false);
    t.is(range.upperBoundInclusive, true);
    t.is(range.withinRange(new Date('2019-12-31 23:59:59')), false);
    t.is(range.withinRange(new Date('2020-01-01 00:00:00')), false);
    t.is(range.withinRange(new Date('2020-06-01 01:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-30 23:59:59')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:00')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:01')), false);
  }

  // Neither lower nor upper bounds are inclusive
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00")');
    t.is(range.lowerBoundInclusive, false);
    t.is(range.upperBoundInclusive, false);
    t.is(range.withinRange(new Date('2019-12-31 23:59:59')), false);
    t.is(range.withinRange(new Date('2020-01-01 00:00:00')), false);
    t.is(range.withinRange(new Date('2020-06-01 01:00:00')), true);
    t.is(range.withinRange(new Date('2020-06-30 23:59:59')), true);
    t.is(range.withinRange(new Date('2020-07-01 00:00:00')), false);
    t.is(range.withinRange(new Date('2020-07-01 00:00:01')), false);
  }
});

test('Invalid bound token throws', (t) => {
  t.throws(() => TsRange.isInclusive('{'));
});

test('Invalid compare operator', (t) => {
  t.throws(() => TsRange.compare(new Date(), new Date(), '<>' as any));
});

test('Comparison date comes before range end', (t) => {
  // Exclusive bound
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00")');
    t.is(range.beforeRangeEnd(new Date('2020-06-01 00:00:00')), true);
    t.is(range.beforeRangeEnd(new Date('2020-07-01 00:00:00')), false);
    t.is(range.beforeRangeEnd(new Date('2020-07-01 00:00:01')), false);
  }

  // Inclusive bound
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00"]');
    t.is(range.beforeRangeEnd(new Date('2020-06-01 00:00:00')), true);
    t.is(range.beforeRangeEnd(new Date('2020-07-01 00:00:00')), true);
    t.is(range.beforeRangeEnd(new Date('2020-07-01 00:00:01')), false);
  }
});

test('Comparison date comes after range end', (t) => {
  // Exclusive bound
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00")');
    t.is(range.afterRangeEnd(new Date('2020-06-01 00:00:00')), false);
    t.is(range.afterRangeEnd(new Date('2020-07-01 00:00:00')), true);
    t.is(range.afterRangeEnd(new Date('2020-07-01 00:00:01')), true);
  }

  // Inclusive bound
  {
    const range = new TsRange('("2020-01-01 00:00:00","2020-07-01 00:00:00"]');
    t.is(range.afterRangeEnd(new Date('2020-06-01 00:00:00')), false);
    t.is(range.afterRangeEnd(new Date('2020-07-01 00:00:00')), false);
    t.is(range.afterRangeEnd(new Date('2020-07-01 00:00:01')), true);
  }
});
