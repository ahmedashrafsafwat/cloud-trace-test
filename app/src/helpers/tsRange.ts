/**
 * Postgres has its own range type for dates. This class helps work with the
 * retrieved pattern.
 */
import parse from 'date-fns/parse';

type Operator = '<' | '<=' | '>' | '>=';
const regexTsRange =
  /^([\[(])"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})","(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"([\])])$/;

export default class TsRange {
  private pattern: string;
  readonly lowerBound: Date;
  readonly upperBound: Date;
  readonly lowerBoundInclusive: boolean;
  readonly upperBoundInclusive: boolean;

  static isInclusive(boundToken: string) {
    if (['[', ']'].includes(boundToken)) {
      return true;
    } else if (['(', ')'].includes(boundToken)) {
      return false;
    }

    throw new Error('Invalid TsRange bound token provided');
  }

  static compare(date1: Date, date2: Date, operator: Operator) {
    switch (operator) {
      case '<':
        return date1 < date2;
      case '<=':
        return date1 <= date2;
      case '>':
        return date1 > date2;
      case '>=':
        return date1 >= date2;
      default:
        throw new Error('Invalid operator');
    }
  }

  constructor(pattern: string) {
    this.pattern = pattern;
    const match = regexTsRange.exec(pattern);
    if (match == null) {
      throw new Error('Invalid TsRange pattern');
    }
    this.lowerBound = parse(match[2], 'yyyy-MM-dd HH:mm:ss', new Date());
    this.upperBound = parse(match[3], 'yyyy-MM-dd HH:mm:ss', new Date());
    this.lowerBoundInclusive = TsRange.isInclusive(match[1]);
    this.upperBoundInclusive = TsRange.isInclusive(match[4]);

    if (this.lowerBound > this.upperBound) {
      throw new Error('TsRange lower bound after upper bound');
    }
  }

  withinRange(date: Date) {
    const lowerOperator = this.lowerBoundInclusive ? '>=' : '>';
    const upperOperator = this.upperBoundInclusive ? '<=' : '<';
    return (
      TsRange.compare(date, this.lowerBound, lowerOperator) &&
      TsRange.compare(date, this.upperBound, upperOperator)
    );
  }

  beforeRangeEnd(date: Date) {
    const upperOperator = this.upperBoundInclusive ? '<=' : '<';
    return TsRange.compare(date, this.upperBound, upperOperator);
  }

  afterRangeEnd(date: Date) {
    const upperOperator = this.upperBoundInclusive ? '>' : '>=';
    return TsRange.compare(date, this.upperBound, upperOperator);
  }
}
