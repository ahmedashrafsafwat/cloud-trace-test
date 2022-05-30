import envSchema from 'env-schema';
import constants from './constants';

const {
  DATABASE_URL,
  DATABASE_URL_READ,
  KEYCLOAK_BASE,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  RABBIT_HOST,
  RABBIT_PORT,
} = constants;

const config = {
  DATABASE_URL: {
    type: 'string',
    default: DATABASE_URL,
  },
  DATABASE_URL_READ: {
    type: 'string',
    default: DATABASE_URL_READ,
  },
  DATABASE_URL_MANAGEMENT: {
    type: 'string',
    default: '',
  },

  RABBIT_HOST: {
    type: 'string',
    default: RABBIT_HOST,
  },
  RABBIT_PORT: {
    type: 'number',
    default: RABBIT_PORT,
  },
  KEYCLOAK_BASE: {
    type: 'string',
    default: KEYCLOAK_BASE,
  },
  KEYCLOAK_REALM: {
    type: 'string',
    default: KEYCLOAK_REALM,
  },
  KEYCLOAK_CLIENT_ID: {
    type: 'string',
    default: KEYCLOAK_CLIENT_ID,
  },
  KEYCLOAK_CLIENT_SECRET: {
    type: 'string',
    default: KEYCLOAK_CLIENT_SECRET,
  },

  REDIS_HOST: {
    type: 'string',
    default: 'redis-service',
  },
  REDIS_PORT: {
    type: 'number',
    default: 6379,
  },
  REDIS_CONNECTION_TIMEOUT: {
    type: 'number',
    default: 1500,
  },
  REDIS_MAX_RETRIES_PER_REQUEST: {
    type: 'number',
    default: 5,
  },
  BATCH_COUNT: {
    type: 'number',
    default: 20,
  },
  // ignore cash point closing starting from certain timestamp
  MIGRATE_CPC_THRESHOLD: {
    type: 'number',
    default: 1640343600, // 2021-12-24
  },
  // ignore cash point closing starting from certain version
  MIGRATE_CPC_VERSION_THRESHOLD: {
    type: 'number',
    default: 1000000, // version 1.0.0
  },
  MAX_CPC_MIGRATIONS: {
    type: 'number',
    default: 10,
  },

  METRIC_PROJECT_ID: {
    type: 'string',
    default: 'fiskaly',
  },
  METRIC_LOCATION: {
    type: 'string',
    default: 'local',
    enum: ['prod-cluster', 'dev-cluster', 'local'],
  },
  GOOGLE_APPLICATION_CREDENTIALS: {
    type: 'string',
    default: '',
  },

  LOG_LEVEL: {
    type: 'string',
    default: 'info',
    enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
  },
};

export const schema = {
  type: 'object',
  required: Object.keys(config), // all properties are required!
  properties: config,
};

export default envSchema({ schema });
