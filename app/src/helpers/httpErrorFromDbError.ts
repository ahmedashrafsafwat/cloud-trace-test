import { BadRequest } from '../lib/errors';

export function getHttpErrorFromDbError(e: any) {
  switch (e?.code) {
    case '22009':
      return BadRequest('One or more time values are out of range');
  }

  return new Error('Unknown error');
}

export async function throwHttpErrorOnDbPromise(promise: Promise<any>, logger) {
  try {
    return await promise;
  } catch (e) {
    logger.error(e);
    throw getHttpErrorFromDbError(e);
  }
}
