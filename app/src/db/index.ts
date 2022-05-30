import postgres from 'postgres';
import knex from 'knex';
import constants from '../constants';
import config from '../config';

const databaseMaxPool = Math.floor(constants.DATABASE_MAX_POOL / 2);

// TODO: Swap with knex
const sql = postgres(config.DATABASE_URL, {
  max: databaseMaxPool,
});

// An additional db client that only reads from a read replica
export const sqlRead = postgres(config.DATABASE_URL_READ, {
  max: databaseMaxPool,
});

const knexInstances = {
  knex: null,
  knexRead: null,
};
export const getKnex = (fromReadReplica = false) => {
  const instanceKey = fromReadReplica ? 'knexRead' : 'knex';
  let instance = knexInstances[instanceKey];
  if (!instance) {
    instance = knex({
      client: 'pg',
      connection: fromReadReplica
        ? config.DATABASE_URL_READ
        : config.DATABASE_URL,
      pool: { min: 0, max: databaseMaxPool },
      debug: false,
    });
    knexInstances[instanceKey] = instance;
  }
  return instance;
};
export const closeAllKnexConnections = async () => {
  const instanceKeys = Object.keys(knexInstances);
  for (const instanceKey of instanceKeys) {
    if (knexInstances[instanceKey]) {
      await knexInstances[instanceKey].destroy();
    }
  }
};

export default sql;
