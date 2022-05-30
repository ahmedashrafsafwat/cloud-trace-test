import { readTar, TarFiles } from '../testHelper';
import * as diff from 'diff';
import * as csv from '@fast-csv/parse';
import kleur from 'kleur';

type Diff = diff.ArrayChange<any>[] | diff.Change[];
export const DEFAULT_IGNORE_FIELDS = [
  'Z_KASSE_ID',
  'Z_ERSTELLUNG',
  'TSE_TA_START',
  'TSE_TA_ENDE',
];

interface DiffTable {
  [rowIndex: number]: number[];
}

export class DiffError extends Error {
  diffResult: Diff;
  diffTable: string;

  constructor(message: string, diffTable: string);
  constructor(message: string, diffResult: Diff);
  constructor(message: string, diffResultOrTable) {
    super(message);

    if (typeof diffResultOrTable === 'string') {
      this.diffTable = diffResultOrTable;
    } else {
      this.diffResult = diffResultOrTable as Diff;
    }
  }

  toString() {
    const printableDiffResult =
      this.diffTable != null ? this.diffTable : printableDiff(this.diffResult);
    return '' + this.message + '\n' + printableDiffResult;
  }
}

export class MultipleDiffError extends Error {
  diffErrors: DiffError[];

  constructor(message: string, diffErrors: DiffError[]) {
    super(message);
    this.diffErrors = diffErrors;
  }

  toString() {
    const messages = this.diffErrors.map((e) => e.toString());
    return `${this.message}\n\n${messages.join('\n\n')}`;
  }
}

export function hasDifferences(diffResult: Diff) {
  for (const entry of diffResult) {
    if (entry.added || entry.removed) {
      return true;
    }
  }
}

export function throwOnDiff(message: string, diffResult: Diff) {
  if (hasDifferences(diffResult)) {
    throw new DiffError(message, diffResult);
  }
}

export function shouldIgnoreField(
  fileName: string,
  fieldName: string,
  ignoreFields: string[],
) {
  // If no ignoreFields are provided, then all fields should be checked.
  if (ignoreFields == null) {
    return false;
  }

  for (const entry of ignoreFields) {
    const parts = entry.split('/');
    let shouldBeIgnored = false;
    if (parts.length > 1) {
      // Allowing to ignore fields file wise
      shouldBeIgnored = parts[0] === fileName && parts[1] === fieldName;
    } else {
      // If the filter is not split into 2 value, read it as a global ignore
      // field.
      shouldBeIgnored = parts[0] === fieldName;
    }

    if (shouldBeIgnored) {
      return true;
    }
  }

  return false;
}

function stringifyDiffTable(
  headers: string[],
  actualParsedCsv: string[][],
  expectedParsedCsv: string[][],
  diffs: DiffTable,
) {
  const maxFieldNameLength = headers.reduce((maxLength, header) => {
    return Math.max(maxLength, header.length);
  }, 0);
  const rowsWithDiff = Object.keys(diffs).map((key) => +key);
  const lines: string[] = [];
  for (const rowIndex of rowsWithDiff) {
    const fieldIndexes = diffs[rowIndex];
    const rowLine: string[] = [`#${rowIndex + 1}`];
    for (const fieldIndex of fieldIndexes) {
      const fieldName = headers[fieldIndex];
      const actualValue = String(actualParsedCsv?.[rowIndex]?.[fieldIndex]);
      const expectedValue = String(expectedParsedCsv?.[rowIndex]?.[fieldIndex]);
      rowLine.push(
        [
          `${(fieldName + ':').padEnd(
            maxFieldNameLength + 1,
          )} - ${actualValue}`,
          ' '.repeat(maxFieldNameLength + 2) + `+ ${expectedValue}`,
        ].join('\n'),
      );
    }
    lines.push(rowLine.join('\n'));
  }
  return '\n' + lines.join('\n\n');
}

function matchingHeaders(fileName, actualResult, expectedResult) {
  const actualHeader = actualResult[0];
  if (actualResult.length > 0 && expectedResult.length > 0) {
    const expectedHeader = expectedResult[0];

    const diffResult = diff.diffArrays(actualHeader, expectedHeader);
    throwOnDiff(`Headers for ${fileName} differ`, diffResult);
  }
  return actualHeader;
}

function sortByColumns(headers: string[], rows: string[][], sortBy: string[]) {
  const sortByFieldIndexes = sortBy.map((sortByField) => {
    const index = headers.indexOf(sortByField);
    if (index === -1) {
      throw new Error(`sortBy field ${sortByField} not found in headers`);
    }
    return index;
  });

  rows.sort((rowA, rowB) => {
    for (const sortIndex of sortByFieldIndexes) {
      const a = rowA[sortIndex];
      const b = rowB[sortIndex];

      const compared = a.localeCompare(b);
      if (compared !== 0) {
        return compared;
      }
    }
    return 0;
  });
}

function sortActualAndExpectedCsv(
  sortBy,
  actualHeader,
  actualResult,
  expectedResult,
) {
  if (sortBy != null) {
    sortByColumns(actualHeader, actualResult, sortBy);
    sortByColumns(actualHeader, expectedResult, sortBy);
  }
}

function throwOrReturnOnCsvDiff(
  fileName,
  diffsFound,
  shouldThrowOnDiff,
  actualHeader,
  actualResult,
  expectedResult,
  diffs,
) {
  if (!diffsFound) {
    return;
  }

  const e = new DiffError(
    `File ${fileName} differs`,
    stringifyDiffTable(actualHeader, actualResult, expectedResult, diffs),
  );

  if (shouldThrowOnDiff) throw e;
  return e;
}

export async function diffCsvFile(
  fileName: string,
  actualCsv: string,
  expectedCsv: string,
  options: Partial<csv.ParserOptions> = {
    delimiter: ';',
  },
  ignoreFields?: string[],
  sortBy?: string[],
  shouldThrowOnDiff = true,
) {
  const parseString = (csvRaw: string): Promise<string[][]> => {
    const rows: string[][] = [];
    return new Promise((resolve) => {
      csv
        .parseString(csvRaw, options)
        .on('error', (error) => {
          throw error;
        })
        .on('data', (row: string[]) => rows.push(row))
        .on('end', () => resolve(rows));
    });
  };

  const actualResult = await parseString(actualCsv);
  const expectedResult = await parseString(expectedCsv);
  // Check if headers match
  const actualHeader = matchingHeaders(fileName, actualResult, expectedResult);

  // Remove header from list
  actualResult.shift();
  expectedResult.shift();
  sortActualAndExpectedCsv(sortBy, actualHeader, actualResult, expectedResult);

  // Check row by row
  const rowCount = Math.max(actualResult.length, expectedResult.length);
  // Collecting all diffs for each row and each field.
  const diffs: DiffTable = {};
  // Initialize maxFieldLengths and set all to 0. Later on we will fill this up.
  const maxFieldLengths: number[] = Array.from({
    length: actualResult[0].length,
  }).map(() => 0);

  let diffsFound = false;
  let columnCount = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const actualRow = actualResult[rowIndex] || [];
    const expectedRow = expectedResult[rowIndex] || [];
    columnCount = Math.max(columnCount, actualRow.length, expectedRow.length);

    const differingFieldIndexes: number[] = [];
    for (let fieldIndex = 0; fieldIndex < columnCount; fieldIndex++) {
      const fieldName = actualHeader[fieldIndex];
      const actualValue = actualRow[fieldIndex];
      const expectedValue = expectedRow[fieldIndex];

      maxFieldLengths[fieldIndex] = Math.max(
        maxFieldLengths[fieldIndex],
        String(actualValue).length,
        String(expectedValue).length,
      );

      if (shouldIgnoreField(fileName, fieldName, ignoreFields)) {
        continue;
      }

      if (actualValue !== expectedValue) {
        diffsFound = true;
        differingFieldIndexes.push(fieldIndex);
      }
    }

    if (differingFieldIndexes.length) {
      diffs[rowIndex] = differingFieldIndexes;
    }
  }

  return throwOrReturnOnCsvDiff(
    fileName,
    diffsFound,
    shouldThrowOnDiff,
    actualHeader,
    actualResult,
    expectedResult,
    diffs,
  );
}

export function printableDiff(diffResult: Diff) {
  const lines: string[] = [];
  if (!Array.isArray(diffResult)) {
    throw new Error('Unable to print diff');
  }

  for (const entry of diffResult) {
    for (let i = 0; i < entry.count; i++) {
      let prefix = ' ';
      let color = (val: string) => val;
      if (entry.added) {
        prefix = '+';
        color = kleur.green;
      } else if (entry.removed) {
        prefix = '-';
        color = kleur.red;
      }

      lines.push(color(`${prefix} ${entry.value[i]}`));
    }
  }
  return '\n' + lines.join('\n');
}

export function diffFileNames(actualFiles: TarFiles, expectedFiles: TarFiles) {
  const actualFileNames = Object.keys(actualFiles).sort();
  const expectedFileNames = Object.keys(expectedFiles).sort();

  const diffResult = diff.diffArrays(actualFileNames, expectedFileNames);
  throwOnDiff('File names differ', diffResult);
}

/**
 * Creates a diff of 2 tar buffers
 */
export default async function diffExports(
  actual: Buffer,
  expected: Buffer,
  ignoreFields?: string[],
  sortBy?: { [fileName: string]: string[] },
) {
  const actualFiles = await readTar(actual);
  const expectedFiles = await readTar(expected);
  const errors = [];

  diffFileNames(actualFiles, expectedFiles);
  const files = Object.keys(actualFiles);
  for (const fileName of files) {
    // Ignore non CSV files
    if (!fileName.endsWith('.csv')) {
      continue;
    }

    const result = await diffCsvFile(
      fileName,
      actualFiles[fileName],
      expectedFiles[fileName],
      undefined,
      ignoreFields || DEFAULT_IGNORE_FIELDS,
      sortBy?.[fileName],
      false,
    );
    if (result != null) {
      errors.push(result);
    }
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1)
    throw new MultipleDiffError('Multiple diff errors found', errors);
}
