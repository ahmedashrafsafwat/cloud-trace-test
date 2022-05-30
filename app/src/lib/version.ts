'use strict';
import semver from 'semver';
import packageJson from '../../package.json';

const FACTOR_MAJOR = 1000000;
const FACTOR_MINOR = 1000;

function toNumber(str: string): number {
  const major = semver.major(str);
  const minor = semver.minor(str);
  const patch = semver.patch(str);
  return major * FACTOR_MAJOR + minor * FACTOR_MINOR + patch;
}

function toString(num: number): string {
  const patch = num % FACTOR_MINOR;
  const minor = (num - patch) % FACTOR_MAJOR;
  const major = num - patch - minor;
  return [major / FACTOR_MAJOR, minor / FACTOR_MINOR, patch].join('.');
}

const VERSION = toNumber(packageJson.version);

export { toString, toNumber, VERSION };
