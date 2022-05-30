import { Env } from '../routes/api/models';
import { toString, VERSION } from '../lib/version';

interface HasObjectChangedInput<T> {
  newObject: T;
  oldObject?: T;
  checkKeys: string[];
}

export function hasObjectChanged<T>({
  newObject,
  oldObject,
  checkKeys,
}: HasObjectChangedInput<T>): boolean {
  if (!oldObject) {
    return true;
  }

  if (!newObject) {
    throw Error('Missing newObject!');
  }

  for (const key in newObject) {
    if (newObject.hasOwnProperty(key) && oldObject.hasOwnProperty(key)) {
      if (
        typeof newObject[key] === 'object' &&
        typeof oldObject[key] === 'object'
      ) {
        if (
          JSON.stringify(newObject[key]) !== JSON.stringify(oldObject[key]) &&
          (checkKeys.length === 0 || checkKeys.includes(key))
        ) {
          return true;
        }
      } else {
        if (
          newObject[key] !== oldObject[key] &&
          (checkKeys.length === 0 || checkKeys.includes(key))
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

type ObjectType =
  | 'CASH_REGISTER'
  | 'CASH_REGISTERS'
  | 'VAT_DEFINITION'
  | 'VAT_DEFINITIONS'
  | 'PURCHASER_AGENCY'
  | 'PURCHASER_AGENCIES'
  | 'CASH_POINT_CLOSING'
  | 'CASH_POINT_CLOSINGS';

export interface StandardResponseProperties {
  _type: ObjectType;
  _version: number;
  _env: Env;
}

export function addStandardResponseProperties(object, type: ObjectType) {
  object._type = type;
  object._version = toString(object.version || VERSION);
  object._env = object.env;

  if (type === 'CASH_REGISTER') {
    object.cash_register_type = object.master_client_id
      ? object.tss_id
        ? 'SLAVE_WITH_TSS'
        : 'SLAVE_WITHOUT_TSS'
      : 'MASTER';

    object.software = {
      brand: object.sw_brand,
      version: object.sw_version,
    };
    object.processing_flags = {
      UmsatzsteuerNichtErmittelbar: !!object.vat_not_determineable,
    };
  }
  if (object.export_creation_date) {
    object.export_creation_date = Math.floor(
      object.export_creation_date.getTime() / 1000,
    );
  }
  if (object.time_creation) {
    object.time_creation = Math.floor(object.time_creation.getTime() / 1000);
  }
  if (object.time_update) {
    object.time_update = Math.floor(object.time_update.getTime() / 1000);
  }
  if (object.time_deleted) {
    object.time_deleted = Math.floor(object.time_deleted.getTime() / 1000);
  }

  object.sign_api_version = object.sign_api_version ?? 1;

  return object;
}

export const zip = <T, K>(arr1: T[], arr2: K[]): [T, K][] => {
  if (arr1.length !== arr2.length) {
    throw new Error('lengths mismatch');
  }
  return arr1.map((it, idx) => [it, arr2[idx]]);
};

export type JSONType =
  | string
  | number
  | boolean
  | JSONType[]
  | { [key: string]: JSONType };

export type JSONObject = { [key: string]: JSONType };

export const clone = <T extends JSONObject>(obj: T): T =>
  Object.entries(obj).reduce(
    (prev: Partial<T>, [key, value]) =>
      ({
        ...prev,
        [key]:
          (Array.isArray(value) && [...value]) ||
          (typeof value === 'object' && clone(value as JSONObject)) ||
          value,
      } as Partial<T>),
    {} as Partial<T>,
  ) as T;

// TODO: use lodash.get
export const get = <T extends JSONObject>(
  obj: T,
  path: string,
): [JSONType, JSONObject] | undefined => {
  const match = path.match(/(\["[^"]+"])(?:\["[^"]+"])*/);
  if (!match) {
    return undefined;
  }
  const matchIndex = path.indexOf(match[0]);
  if (matchIndex !== 0) {
    return undefined;
  }
  const rest = path.substr(matchIndex + match[1].length);
  const current = match[1].match(/\["([^"]+)"\]/)[1];
  const next = obj[current];
  if (rest.length === 0) {
    return [next, obj];
  }
  if (!Object.keys(obj).includes(current)) {
    return undefined;
  }
  if (typeof next !== 'object') {
    return undefined;
  }
  if (Array.isArray(next)) {
    return undefined;
  }
  return get(next, rest);
};

export const findPaths = <T extends JSONObject>(
  obj: T,
  target = 'description',
  queue = [],
): [string, string][] =>
  Object.entries(obj)
    .map(([key, value]): [string, string][] => {
      const path = [...queue, key];
      if (key === target) {
        return [[path.map((it) => `["${it}"]`).join(''), `${value}`]];
      }
      if (Array.isArray(value)) {
        return undefined;
      }
      if (typeof value === 'object') {
        return findPaths(value, target, path);
      }
      return undefined;
    })
    .flat(1)
    .filter(Boolean);

export const isValidDateFormat = (dateString: string): boolean => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};
