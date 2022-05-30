import test from 'ava';
import diffExports, {
  diffCsvFile,
  diffFileNames,
  MultipleDiffError,
  shouldIgnoreField,
} from './diffExports';
import fs from 'fs';

test('Checks an object for different keys (filenames)', (t) => {
  // No differences
  {
    const a = {
      'a.csv': '',
      'b.csv': '',
    };
    const b = {
      'a.csv': '',
      'b.csv': '',
    };
    t.notThrows(() => {
      diffFileNames(a, b);
    });
  }

  // Differences
  {
    const a = {
      'a.csv': '',
      'b.csv': '',
    };
    const b = {
      'a.csv': '',
      'c.csv': '',
    };
    t.throws(() => {
      diffFileNames(a, b);
    });
  }
});

test('Should field be ignored', (t) => {
  t.is(shouldIgnoreField('vat.csv', 'UNKNOWN', ['vat.csv/UNKNOWN']), true);
  t.is(shouldIgnoreField('vat.csv', 'UNKNOWN', ['UNKNOWN', 'UNKNOWN2']), true);
  t.is(shouldIgnoreField('vat.csv', 'KNOWN', ['UNKNOWN', 'UNKNOWN2']), false);
});

test('Diff of csv files', async (t) => {
  try {
    await diffCsvFile(
      'test.csv',
      [
        '"Column1";"Column2";"Column3"',
        '"Value1.1";"Value1.2";"Value1.3"',
        '"Value2.1";"Value2.2";"Value2.3"',
        '"Value3.1";"Value3.2";"Value3.3"',
        '"Value4.1";"Value4.2";"Value4.3"',
        '"Value5.1";"Value5.2";"Value5.3"',
      ].join('\n'),
      [
        '"Column1";"Column2";"Column3"',
        '"Value1.1";"Value2";"Value1.3"',
        '"Value2.1";"Value2";"Value2.3"',
      ].join('\n'),
      undefined,
      ['Column2'],
    );
    t.fail('Should throw');
  } catch (e) {
    t.is(
      e.toString(),
      'File test.csv differs\n' +
        '\n' +
        '#3\n' +
        'Column1: - Value3.1\n' +
        '         + undefined\n' +
        'Column3: - Value3.3\n' +
        '         + undefined\n' +
        '\n' +
        '#4\n' +
        'Column1: - Value4.1\n' +
        '         + undefined\n' +
        'Column3: - Value4.3\n' +
        '         + undefined\n' +
        '\n' +
        '#5\n' +
        'Column1: - Value5.1\n' +
        '         + undefined\n' +
        'Column3: - Value5.3\n' +
        '         + undefined',
    );
  }
});

test('Diff of csv files with sorting', async (t) => {
  await t.notThrowsAsync(async () => {
    await diffCsvFile(
      'test.csv',
      [
        '"Column1";"Column2";"Column3"',
        '"Value1.1";"Value3.2";"Value3.3"',
        '"Value2.1";"Value2.2";"Value2.3"',
        '"Value3.1";"Value2.2";"Value1.3"',
        '"Value4.1";"Value4.2";"Value4.3"',
        '"Value5.1";"Value5.2";"Value5.3"',
      ].join('\n'),
      [
        '"Column1";"Column2";"Column3"',
        '"Value2.1";"Value2.2";"Value2.3"',
        '"Value3.1";"Value2.2";"Value1.3"',
        '"Value1.1";"Value3.2";"Value3.3"',
        '"Value4.1";"Value4.2";"Value4.3"',
        '"Value5.1";"Value5.2";"Value5.3"',
      ].join('\n'),
      undefined,
      ['Column2'],
      ['Column2', 'Column3'],
    );
  });
});

test('Diff error on values', async (t) => {
  try {
    await diffCsvFile(
      'test.csv',
      ['"Column1";"Column2"', '"Value1";"Value2"'].join('\n'),
      ['"Column1";"Column2"', '"X";"Value2"'].join('\n'),
    );
    t.fail('Should throw');
  } catch (e) {
    t.is(
      e.toString(),
      'File test.csv differs\n' +
        '\n' +
        '#1\n' +
        'Column1: - Value1\n' +
        '         + X',
    );
  }
});

test('Diff error is printable', async (t) => {
  const a = {
    'a.csv': '',
    'aa.csv': '',
    'b.csv': '',
  };
  const b = {
    'a.csv': '',
    'aa.csv': '',
    'c.csv': '',
  };
  try {
    diffFileNames(a, b);
    t.fail('Should throw');
  } catch (e) {
    t.is(
      e.toString(),
      [
        'File names differ',
        '',
        '  a.csv',
        '  aa.csv',
        '- b.csv',
        '+ c.csv',
      ].join('\n'),
    );
  }
});

test('Test actual diffExports using tar files', async (t) => {
  const tarBuffer1 = fs.readFileSync('./src/fixtures/response.tar');
  const tarBuffer2 = fs.readFileSync(
    './src/fixtures/response-with-historic.tar',
  );

  // Checking against same buffer
  {
    await t.notThrowsAsync(async () => {
      await diffExports(tarBuffer1, tarBuffer1);
    });
  }

  // Checking against different tar files
  {
    await t.throwsAsync(
      async () => {
        await diffExports(tarBuffer1, tarBuffer2);
      },
      { instanceOf: MultipleDiffError },
    );
  }
});
