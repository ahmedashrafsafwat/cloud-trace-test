import { Env } from './routes/api/models';

interface Constants {
  E_TRANSACTIONS_MISSING: string;
  E_FAILED_SCHEMA_VALIDATION: string;
  E_ID_NOT_FOUND: string;
  E_NO_DATA_AVAILABLE: string;
  E_TOO_MANY_RECORDS: string;
  E_NOT_IMPLEMENTED: string;
  PG_HOST: string;
  PG_USER: string;
  PG_PASSWORD: string;
  PG_DATABASE: string;
  DATABASE_URL: string;
  DATABASE_URL_READ: string;
  DATABASE_MAX_POOL: number;
  TAXONOMIE_VERSION: string;
  KEYCLOAK_BASE: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  E_BAD_REQUEST: string;
  E_INVALID_STATE_CHANGE: string;
  E_CASH_REGISTER_NOT_FOUND: string;
  E_CASH_REGISTER_CONFLICT: string;
  E_CASH_POINT_CLOSING_NOT_FOUND: string;
  E_CASH_POINT_CLOSING_CONFLICT: string;
  E_EXPORT_CONFLICT: string;
  E_PURCHASER_AGENCY_NOT_FOUND: string;
  E_VAT_DEFINITION_NOT_FOUND: string;
  E_EXPORT_NOT_FOUND: string;
  E_EXPORTS_NOT_FOUND: string;
  E_CLIENT_NOT_FOUND: string;
  E_TSS_NOT_FOUND: string;
  E_DOWNLOAD_NOT_FOUND: string;
  E_UNKNOWN: string;
  RABBIT_HOST: string;
  RABBIT_PORT: number;
  RABBIT_USER: string;
  RABBIT_PASSWORD: string;
  MINIO_HOST: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  DSFINVK_BUCKET: string;
  DSFINVK_BUCKET_REGION: string;
  DSFINVK_MESSAGE_STORAGE_BUCKET: string;
  DSFINVK_MESSAGE_STORAGE_BUCKET_FOLDER_CLOSINGS: string;
  DSFINVK_MESSAGE_STORAGE_BUCKET_FOLDER_EXPORTS: string;
  DSFINVK_EXPORT_BASE_URL: string;
  DSFINVK_EXPORT_QUEUE_SWITCH: Env;
  DASHBOARD_URL: string;
  KASSENSICHV_URL: string;
  KASSENSICHV_APIV: string | number;

  REDIS_ORGANIZATION_KEY_PREFIX: string;

  METRIC_EXPORT_DURATION: string;
  METRIC_EXPORT_PROCESS_DURATION: string;
  METRIC_CASH_POINT_CLOSING_DURATION: string;
  METRIC_CASH_POINT_CLOSING_PROCESS_DURATION: string;
  METRIC_FUNCTION_DURATION: string;
}

function defaults(obj: Constants): Constants {
  const result = {};

  for (const key in obj) {
    result[key] = process.env[key] || obj[key];
    // use the custom db connection variables only if we are in development environment
    const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, NODE_ENV } = process.env;
    if (
      (key == 'DATABASE_URL' || key == 'DATABASE_URL_READ') &&
      PGHOST &&
      PGUSER &&
      PGPASSWORD &&
      PGDATABASE &&
      NODE_ENV === 'development'
    ) {
      result[
        key
      ] = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`;
      console.log(
        `${key} is overwritten from postgres related environment variables`,
      );
    }
  }

  return result as Constants;
}

const constants = defaults({
  E_FAILED_SCHEMA_VALIDATION: 'E_FAILED_SCHEMA_VALIDATION',
  E_ID_NOT_FOUND: 'E_ID_NOT_FOUND',
  E_NO_DATA_AVAILABLE: 'E_NO_DATA_AVAILABLE',
  E_TOO_MANY_RECORDS: 'E_TOO_MANY_RECORDS',
  E_NOT_IMPLEMENTED: 'E_NOT_IMPLEMENTED',
  E_BAD_REQUEST: 'E_BAD_REQUEST',
  E_CASH_REGISTER_NOT_FOUND: 'E_CASH_REGISTER_NOT_FOUND',
  E_CASH_REGISTER_CONFLICT: 'E_CASH_REGISTER_CONFLICT',
  E_CASH_POINT_CLOSING_NOT_FOUND: 'E_CASH_POINT_CLOSING_NOT_FOUND',
  E_CASH_POINT_CLOSING_CONFLICT: 'E_CASH_POINT_CLOSING_CONFLICT',
  E_PURCHASER_AGENCY_NOT_FOUND: 'E_PURCHASER_AGENCY_NOT_FOUND',
  E_VAT_DEFINITION_NOT_FOUND: 'E_VAT_DEFINITION_NOT_FOUND',
  E_EXPORT_NOT_FOUND: 'E_EXPORT_NOT_FOUND',
  E_EXPORTS_NOT_FOUND: 'E_EXPORTS_NOT_FOUND',
  E_CLIENT_NOT_FOUND: 'E_CLIENT_NOT_FOUND',
  E_TSS_NOT_FOUND: 'E_TSS_NOT_FOUND',
  E_DOWNLOAD_NOT_FOUND: 'E_DOWNLOAD_NOT_FOUND',
  E_TRANSACTIONS_MISSING: 'E_TRANSACTIONS_MISSING',
  E_EXPORT_CONFLICT: 'E_EXPORT_CONFLICT',
  E_INVALID_STATE_CHANGE: 'E_INVALID_STATE_CHANGE',
  E_UNKNOWN: 'E_UNKNOWN',
  PG_HOST: 'postgres-service',
  PG_USER: 'postgres',
  PG_PASSWORD: 'postgres',
  PG_DATABASE: 'postgres',
  DATABASE_URL: 'postgres://postgres:postgres@postgres-service/postgres',
  DATABASE_URL_READ: 'postgres://postgres:postgres@postgres-service/postgres',
  DATABASE_MAX_POOL: 16,

  TAXONOMIE_VERSION: '2.1.1',

  KEYCLOAK_BASE: 'https://auth.fiskaly.com/auth',
  KEYCLOAK_REALM: 'fiskaly-dev',
  KEYCLOAK_CLIENT_ID: 'dsfinvk-api',
  KEYCLOAK_CLIENT_SECRET: '6acab706-705e-4bf6-8e4e-0b2073402567',

  RABBIT_HOST: 'rabbitmq-service',
  RABBIT_PORT: 5672,
  RABBIT_USER: 'rabbit',
  RABBIT_PASSWORD: 'rabbit',
  MINIO_HOST: 'minio-service',
  MINIO_PORT: 9000,
  MINIO_ACCESS_KEY: 'accesskey',
  MINIO_SECRET_KEY: 'secretkey',
  DSFINVK_BUCKET: 'dsfinvk',
  DSFINVK_BUCKET_REGION: 'eu-central-1',
  DSFINVK_EXPORT_BASE_URL: 'https://dsfinvk.fiskaly.dev',
  DSFINVK_MESSAGE_STORAGE_BUCKET: 'dsfinvk-message-storage-dev',
  DSFINVK_MESSAGE_STORAGE_BUCKET_FOLDER_CLOSINGS: 'cashpointclosing-messages',
  DSFINVK_MESSAGE_STORAGE_BUCKET_FOLDER_EXPORTS: 'export-messages',
  DSFINVK_EXPORT_QUEUE_SWITCH: 'LIVE',

  DASHBOARD_URL: 'https://dashboard.fiskaly.dev',
  KASSENSICHV_URL: 'https://kassensichv.fiskaly.dev',
  KASSENSICHV_APIV: '1',

  REDIS_ORGANIZATION_KEY_PREFIX: 'dsfinvkV0:orginfo:',

  METRIC_EXPORT_DURATION: 'dsfinvk/export/duration',
  METRIC_EXPORT_PROCESS_DURATION: 'dsfinvk/export/process-duration',
  METRIC_CASH_POINT_CLOSING_DURATION: 'dsfinvk/cash_point_closing/duration',
  METRIC_CASH_POINT_CLOSING_PROCESS_DURATION:
    'dsfinvk/cash_point_closing/process-duration',
  METRIC_FUNCTION_DURATION: 'dsfinvk/function/duration',
});

export default constants;
