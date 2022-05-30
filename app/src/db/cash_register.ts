// TODO check if all those awaits are needed!

import {
  ClientId,
  Revision,
  OrganizationId,
  Env,
  CashRegisterCollectionQuerystring,
  SignApiVersionType,
} from '../routes/api/models';
import sql, { getKnex } from './';
import {
  addStandardResponseProperties,
  hasObjectChanged,
} from '../helpers/utilities';
import SqlString from 'sqlstring';
import { CashRegisterEntity } from '../models/db';
import { CashregisterCsv } from '../models/dsfinvk';
import appendSignApiVersionQuery from './appendSignApiVersionQuery';
import { CashRegisterConflict } from '../lib/errors';
import { logTime } from '../lib/metrics';
import knexMapStreamHandler, {
  knexMapCallbackStreamHandler,
} from './knexMapStreamHandler';
import { TSS } from '../models';

export interface CashRegisterEntityWithCashPointClosingId {
  client_id: string;
  revision: number;
  brand: string;
  model: string;
  base_currency_code: string;
  vat_not_determineable: boolean;
  sw_brand: string;
  sw_version: string;
  tss_id: string;
  master_client_id?: string;
  cash_point_closing_id: string;
  serial_number: string;
  signature_algorithm: string;
  signature_timestamp_format: string;
  transaction_data_encoding: string;
  public_key: string;
  certificate: string;
}

// overloaders
async function selectCashRegister(
  env: Env,
  organization_id: OrganizationId,
  client_id: ClientId,
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<CashRegisterEntity | null>;
async function selectCashRegister(
  env: Env,
  organization_id: OrganizationId,
  client_id: ClientId[],
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<CashRegisterEntity[] | null>;

async function selectCashRegister(
  env: Env,
  organization_id: OrganizationId,
  client_id: ClientId | ClientId[],
  revision?: Revision,
  sign_api_version?: SignApiVersionType,
): Promise<any | null> {
  const knex = getKnex();
  const query = knex
    .from('cash_registers')
    .where('env', env)
    .andWhere('organization_id', organization_id);

  if (typeof client_id == 'string') {
    query.andWhere('client_id', client_id);
    if (revision) {
      query.andWhere('revision', revision);
    } else {
      const innerQuery = knex
        .from('cash_registers')
        .max('revision')
        .where('client_id', client_id);
      query.andWhere('revision', innerQuery);
    }
    const finalKnexQuery = appendSignApiVersionQuery(query, sign_api_version);
    const result = await finalKnexQuery;
    return ((result && result[0]) as CashRegisterEntity | null) || null;
  }
  query.whereIn('client_id', client_id);
  if (revision) {
    query.andWhere('revision', revision);
    const finalKnexQuery = appendSignApiVersionQuery(query, sign_api_version);
    return ((await finalKnexQuery) as CashRegisterEntity[]) || null;
  } else {
    const finalKnexQuery = appendSignApiVersionQuery(query, sign_api_version);
    const resultObject = await knexMapStreamHandler<CashRegisterEntity>(
      finalKnexQuery.stream(),
      'client_id',
    );
    const result = Object.values(resultObject);
    return result || null;
  }
}

/**
 * Select a cash register and a specific revision by date.
 *
 * @param env             The environment of the client
 * @param organization_id The organization ID that the client needs to be in
 * @param client_id       The client_id to be checked
 * @param select_date     A unix timestamp
 */
const selectCashRegisterByDate = async (
  env: Env,
  organization_id: OrganizationId,
  client_id: ClientId,
  select_date: number,
): Promise<CashRegisterEntity> => {
  const knex = getKnex();
  const select_date_obj = new Date(select_date * 1000);
  const query = knex
    .from('cash_registers')
    .where('env', env)
    .andWhere('organization_id', organization_id)

    .andWhere('client_id', client_id)
    .where(function () {
      this.where('time_update', '<=', select_date_obj).orWhere('revision', 0);
    })
    .orderBy('revision', 'desc')
    .limit(1);
  const result = await query;
  return (result[0] as CashRegisterEntity | null) || null;
};

const selectAllCashRegisters = async (
  env: Env,
  organization_id: OrganizationId,
  query?: CashRegisterCollectionQuerystring,
): Promise<[CashRegisterEntity[], number]> => {
  const result: CashRegisterEntity[] = [];

  const sqlQuery = `
  FROM cash_registers a
    INNER JOIN (
      SELECT client_id, MAX(revision) AS maxRevision 
      FROM cash_registers 
      GROUP BY client_id
    ) b ON a.client_id = b.client_id AND a.revision = b.maxRevision
    WHERE env = ${SqlString.escape(env)}
    AND organization_id = ${SqlString.escape(organization_id)}
  `;

  let sqlResultQuery = `
    SELECT *
    ${sqlQuery}
  `;

  const sqlCountQuery = `
    SELECT COUNT(*)
    ${sqlQuery}
  `;

  if (query) {
    const { order_by, order, limit, offset } = query;

    if (order_by === 'cash_register_type') {
      const typeOrder = !order || order === 'asc' ? 'DESC' : 'ASC';
      sqlResultQuery = sqlResultQuery.concat(
        `ORDER BY master_client_id ${typeOrder}, tss_id `,
      );
    } else {
      sqlResultQuery = sqlResultQuery.concat(`ORDER BY ${order_by} `);
    }
    sqlResultQuery = sqlResultQuery.concat(` ${order} `);
    if (typeof limit === 'number') {
      sqlResultQuery = sqlResultQuery.concat(
        `LIMIT ${SqlString.escape(limit)} `,
      );
    }
    if (typeof offset === 'number') {
      sqlResultQuery = sqlResultQuery.concat(
        `OFFSET ${SqlString.escape(offset)} `,
      );
    }
  }

  const { count } = (await sql.unsafe(sqlCountQuery))[0];
  await sql.unsafe(sqlResultQuery).stream((row: CashRegisterEntity) => {
    result.push(addStandardResponseProperties(row, 'CASH_REGISTER'));
  });

  return [result, count];
};

export interface CashRegisterExportEntity
  extends Omit<CashregisterCsv, 'KASSE_SERIENNR'> {
  client_id: string;
  tss_id: string;
  master_client_id: string | null;
}

export async function selectAllCashRegistersForExportConsumerMessage(
  clientIds: string[],
  organization_id: string,
  env: Env,
  fromReadReplica = false,
): Promise<TSS[]> {
  const knex = getKnex(fromReadReplica);

  const cashRegisters = await knex
    .from({ a: 'cash_registers' })
    .whereIn('client_id', clientIds)
    .andWhere(
      'revision',
      '=',
      knex
        .from({ b: 'cash_registers' })
        .max('revision')
        .where({ organization_id, env })
        .andWhere(knex.raw('b.client_id'), '=', knex.raw('a.client_id')),
    )
    .andWhere({ organization_id, env });

  return cashRegisters.map((cashRegister: CashRegisterEntity) => ({
    clientId: cashRegister.client_id,
    tssId: cashRegister.tss_id,
    clientSerialNumber: cashRegister.serial_number,
    certificateSerial: cashRegister.certificate,
    signatureAlgorithm: cashRegister.signature_algorithm,
    signatureTimestampFormat: cashRegister.signature_timestamp_format,
    transactionDataEncoding: cashRegister.transaction_data_encoding,
    publicKey: cashRegister.public_key,
    certificate: cashRegister.certificate,
  }));
}

export async function selectCashRegistersMapByExportId(
  exportId: string,
  fromReadReplica = false,
) {
  const knex = getKnex(fromReadReplica);
  const fields = [
    'cr.client_id',
    'cr.revision',
    'cr.brand',
    'cr.model',
    'cr.base_currency_code',
    'cr.vat_not_determineable',
    'cr.sw_brand',
    'cr.sw_version',
    'cr.tss_id',
    'cr.master_client_id',
    'c.cash_point_closing_id',
    'cr.serial_number',
    'cr.signature_algorithm',
    'cr.signature_timestamp_format',
    'cr.transaction_data_encoding',
    'cr.public_key',
    'cr.certificate',
  ];
  const query = knex
    .from({ cr: 'cash_registers' })
    .select(...fields)
    .innerJoin({ b: 'cash_point_closings' }, function () {
      this.on('b.client_id', 'cr.client_id').on(
        'b.client_revision',
        'cr.revision',
      );
    })
    .innerJoin(
      { c: 'export_cash_point_closings' },
      'c.cash_point_closing_id',
      'b.cash_point_closing_id',
    )
    .where('c.export_id', exportId)
    .unionAll([
      knex
        .from({ cr: 'cash_registers' })
        .distinctOn('cr.client_id')
        .select(...fields)
        .innerJoin({ t: 'transactions' }, function () {
          this.on('t.closing_client_id', 'cr.client_id').on(
            't.closing_client_revision',
            'cr.revision',
          );
        })
        .innerJoin(
          { c: 'export_cash_point_closings' },
          'c.cash_point_closing_id',
          't.cash_point_closing_id',
        )
        .where('c.export_id', exportId),
    ]);
  return knexMapCallbackStreamHandler<
    CashRegisterEntityWithCashPointClosingId,
    CashRegisterEntityWithCashPointClosingId[]
  >(query.stream(), (row, output) => {
    if (!output[row.client_id]) {
      output[row.client_id] = [];
    }
    output[row.client_id][row.revision] = row;
  });
}

export async function selectClientAndTSEByExport(
  exportId: string,
): Promise<{ clientId: string; tssId: string }[]> {
  const selectClientAndTseByExportTime = logTime('selectClientAndTSEByExport');
  const knex = getKnex();

  const result: { clientId: string; tssId: string }[] = await knex
    .from({ cr: 'cash_registers' })
    .distinct({ clientId: 'cr.client_id' }, { tssId: 'cr.tss_id' })
    .innerJoin({ b: 'cash_point_closings' }, function () {
      this.on('cr.client_id', 'b.client_id').andOn(
        'cr.revision',
        'b.client_revision',
      );
    })
    .innerJoin(
      { c: 'export_cash_point_closings' },
      'b.cash_point_closing_id',
      'c.cash_point_closing_id',
    )
    .where('c.export_id', exportId)
    .union(function () {
      this.from({ cr: 'cash_registers' })
        .distinct({ clientId: 'cr.client_id' }, { tssId: 'cr.tss_id' })
        .innerJoin({ t: 'transactions' }, function () {
          this.on('cr.client_id', 't.closing_client_id').andOn(
            'cr.revision',
            't.closing_client_revision',
          );
        })
        .innerJoin(
          { b: 'cash_point_closings' },
          't.cash_point_closing_id',
          'b.cash_point_closing_id',
        )
        .innerJoin(
          { c: 'export_cash_point_closings' },
          'b.cash_point_closing_id',
          'c.cash_point_closing_id',
        )
        .where('c.export_id', exportId);
    });

  await selectClientAndTseByExportTime.end();
  return result;
}

export async function updateCashRegisterMetadata(
  env: Env,
  organization_id: OrganizationId,
  client_id: ClientId,
  metadata: Record<string, any>,
): Promise<CashRegisterEntity> {
  const knex = getKnex();

  const updateObj = {
    metadata,
  };

  const updatedCashRegister = await knex('cash_registers')
    .where('env', env)
    .andWhere('organization_id', organization_id)
    .andWhere('client_id', client_id)
    .andWhere(
      'revision',
      knex.from('cash_registers').max('revision').where('client_id', client_id),
    )
    .update(updateObj)
    .returning('*');

  return updatedCashRegister[0] || null;
}

const upsertCashRegister = async (
  cashRegister: CashRegisterEntity,
): Promise<CashRegisterEntity> => {
  const existingCashRegister = await selectCashRegister(
    cashRegister.env,
    cashRegister.organization_id,
    cashRegister.client_id,
  );

  const checkKeys = [
    'tss_id',
    'base_currency_code',
    'brand',
    'model',
    'vat_not_determineable',
    'master_client_id',
    'env',
    'serial_number',
    'signature_algorithm',
    'signature_timestamp_format',
    'transaction_data_encoding',
    'public_key',
    'certificate',
  ];
  if (cashRegister.sw_version != null) {
    checkKeys.push('sw_version');
  }
  if (cashRegister.sw_brand != null) {
    checkKeys.push('sw_brand');
  }

  if (existingCashRegister) {
    const existingSignApiVersion = existingCashRegister.sign_api_version || 1;
    const newSignApiVersion = cashRegister.sign_api_version || 1;

    if (existingSignApiVersion !== newSignApiVersion) {
      throw CashRegisterConflict();
    }
  }

  const somethingChanged = hasObjectChanged({
    newObject: cashRegister,
    oldObject: existingCashRegister,
    checkKeys: checkKeys,
  });

  if (somethingChanged) {
    const input: CashRegisterEntity = {
      ...cashRegister,
      revision: existingCashRegister ? existingCashRegister.revision + 1 : 0,
      time_creation: existingCashRegister?.time_creation || new Date(),
      time_update: new Date(),
      metadata: cashRegister.metadata
        ? sql.json(cashRegister.metadata)
        : undefined,
    };

    const newCashRegisterRevision = await sql`
      INSERT INTO cash_registers 
        ${sql(
          input,
          'client_id',
          'revision',
          'tss_id',
          'base_currency_code',
          'brand',
          'model',
          'sw_version',
          'sw_brand',
          'vat_not_determineable',
          'master_client_id',
          'metadata',
          'organization_id',
          'env',
          'version',
          'time_creation',
          'time_update',
          'sign_api_version',
          'serial_number',
          'signature_algorithm',
          'signature_timestamp_format',
          'transaction_data_encoding',
          'public_key',
          'certificate',
        )} 
      RETURNING *
    `;

    if (newCashRegisterRevision[0]) {
      return newCashRegisterRevision[0];
    } else {
      throw new Error('INSERT did not return data');
    }
  } else if (cashRegister.metadata) {
    return await updateCashRegisterMetadata(
      cashRegister.env,
      cashRegister.organization_id,
      cashRegister.client_id,
      cashRegister.metadata,
    );
  }

  return existingCashRegister;
};

export {
  upsertCashRegister,
  selectCashRegister,
  selectAllCashRegisters,
  selectCashRegisterByDate,
};
