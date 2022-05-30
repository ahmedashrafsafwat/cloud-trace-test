import { SignApiVersionType } from '../routes/api/models';

export default function appendSignApiVersionQuery(
  knex: any,
  sign_api_version?: SignApiVersionType,
) {
  if (sign_api_version == null) {
    return knex;
  }

  knex.andWhere('sign_api_version', sign_api_version);
  // To read old data with the old version number, we also select all old entities with no sign_api_version set.
  if (sign_api_version === 1) {
    knex.orWhereNull('sign_api_version');
  }

  return knex;
}
