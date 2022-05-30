import { PassThrough } from 'stream';

export interface DataMap<T> {
  [id: string]: T;
}

export function knexMapCallbackStreamHandler<T, S>(
  stream: PassThrough,
  callback: (row: T, output: DataMap<S>) => void,
): Promise<DataMap<S>> {
  return new Promise((resolve, reject) => {
    const output: DataMap<S> = {};
    stream
      .on('data', function (row: T) {
        callback(row, output);
      })
      .on('error', function (error) {
        reject(error);
      })
      .on('end', () => {
        resolve(output);
      });
  });
}

export default function knexMapStreamHandler<T>(
  stream: PassThrough,
  indexFields: keyof T | (keyof T)[],
): Promise<DataMap<T>> {
  return new Promise((resolve, reject) => {
    const keyFields: (keyof T)[] = Array.isArray(indexFields)
      ? indexFields
      : [indexFields];
    const output: DataMap<T> = {};
    stream
      .on('data', function (row: T) {
        const key: string = keyFields
          .map((subKey: keyof T) => row[subKey])
          .join('-');
        output[key] = row;
      })
      .on('error', function (error) {
        reject(error);
      })
      .on('end', () => {
        resolve(output);
      });
  });
}
