// TODO: use po2json
import path from 'path';
import { zip } from './utilities';
const targetPath = path.resolve(__dirname, '../locales');
import { promises as fs } from 'fs';

export const readFile = async (filename: string) =>
  await fs.readFile(path.resolve(targetPath, filename), 'utf-8');

const msgIdRegex = `msgid "([^"]+)"`;
const msgStrRegex = `msgstr "([^"]+)"`;
export const parsePo = async (input: string) => {
  const [msgIds, msgStrs] = [msgIdRegex, msgStrRegex]
    .map(
      (test) =>
        [input.match(new RegExp(test, 'g')), test] as [string[], string],
    )
    .filter(([matches]) => matches && matches.length > 0)
    .map(([matches, test]) => {
      return matches?.map((match) => {
        return match?.match(test)![1]; // eslint-disable-line
      });
    })
    .filter(Boolean);
  if (!(msgIds && msgStrs)) {
    return undefined;
  }
  return zip(msgIds, msgStrs);
};

export const findByString =
  (arr: [string, string][]) =>
  (test: string): string | undefined => {
    const match = arr.find(([, value]) => value === test);
    if (!match) {
      return undefined;
    }
    return match[0];
  };

export const findById =
  (arr: [string, string][]) =>
  (test: string): string | undefined => {
    const match = arr.find(([key]) => key === test);
    if (!match) {
      return undefined;
    }
    return match[1];
  };

module.exports = {
  findById,
  findByString,
  parsePo,
  readFile,
};
