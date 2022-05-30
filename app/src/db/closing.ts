// TODO Perf check if all those awaits are needed!

import sql, { getKnex } from '.';
import { CashPointClosingEntity } from '../models/db';
import {
  Env,
  ClosingId,
  Metadata,
  CashPointClosingCollectionQuerystring,
  OrganizationId,
  OperationState,
} from '../routes/api/models';
import {
  addStandardResponseProperties,
  isValidDateFormat,
} from '../helpers/utilities';
import { throwHttpErrorOnDbPromise } from '../helpers/httpErrorFromDbError';
import { logTime } from '../lib/metrics';
import knexMapStreamHandler from './knexMapStreamHandler';

export interface CashPointClosingEntityMap {
  [closing_id: string]: CashPointClosingEntity;
}

export async function selectCashPointClosing(
  env: Env,
  organization_id: OrganizationId,
  closing_id: ClosingId,
): Promise<CashPointClosingEntity | null> {
  const selectCashPointClosingTime = logTime('selectCashPointClosing');
  const knex = getKnex();
  const query = knex
    .from({ cpc: 'cash_point_closings' })
    .where('cpc.env', env)
    .andWhere('cpc.cash_point_closing_id', closing_id)
    .andWhere(function () {
      this.where('cpc.organization_id', organization_id).orWhere(
        'cr.organization_id',
        organization_id,
      );
    })
    // TODO: This could be optimized by migrating old cash point closings and setting the organization_id
    .leftJoin({ cr: 'cash_registers' }, 'cpc.client_id', 'cr.client_id');

  query.select('cpc.*').first();
  const result = await throwHttpErrorOnDbPromise(query, console);
  await selectCashPointClosingTime.end();

  return result || null;
}

export async function selectAllCashPointClosings(
  env: Env,
  organization_id: OrganizationId,
  query?: CashPointClosingCollectionQuerystring,
): Promise<[CashPointClosingEntity[], number]> {
  const result: CashPointClosingEntity[] = [];
  const knex = await getKnex();

  // todo: restrict to those fields that need to be returned
  const knexQuery = knex
    .from('cash_point_closings')
    .leftJoin('cash_registers', function () {
      this.on(
        'cash_registers.client_id',
        'cash_point_closings.client_id',
      ).andOn('cash_registers.revision', knex.raw('0'));
    })
    .where('cash_point_closings.env', env)
    .andWhere(function () {
      this.where(
        'cash_point_closings.organization_id',
        organization_id,
      ).orWhere('cash_registers.organization_id', organization_id);
    });

  const {
    client_id,
    start_date,
    end_date,
    business_date_start,
    business_date_end,
    states,
    limit,
    offset,
    order_by,
    order,
  } = query || ({} as any);

  if (client_id) {
    knexQuery.andWhere('cash_point_closings.client_id', client_id);
  }
  if (start_date) {
    knexQuery.andWhere(
      'cash_point_closings.time_creation',
      '>',
      new Date(start_date * 1000),
    );
  }
  if (end_date) {
    knexQuery.andWhere(
      'cash_point_closings.time_creation',
      '<',
      new Date(end_date * 1000),
    );
  }

  if (business_date_start && isValidDateFormat(business_date_start)) {
    knexQuery.andWhere(
      knex.raw(
        'COALESCE(cash_point_closings.business_date, cash_point_closings.export_creation_date)',
      ),
      '>=',
      new Date(business_date_start),
    );
  }
  if (business_date_end && isValidDateFormat(business_date_end)) {
    knexQuery.andWhere(
      knex.raw(
        'COALESCE(cash_point_closings.business_date, cash_point_closings.export_creation_date)',
      ),
      '<=',
      new Date(business_date_end),
    );
  }

  if (typeof states === 'string') {
    knexQuery.andWhere('cash_point_closings.state', states);
  } else if (Array.isArray(states) && states.length > 0) {
    knexQuery.whereIn('cash_point_closings.state', states);
  }

  // count the rows
  const { count } = await knexQuery.clone().count('*').first();

  // add pagination and order by
  if (order_by === 'business_date') {
    knexQuery.orderBy(
      knex.raw(
        'COALESCE(cash_point_closings.business_date, cash_point_closings.export_creation_date)',
      ),
      order,
    );
  } else {
    knexQuery.orderBy(knex.raw('cash_point_closings.??', [order_by]), order);
  }

  knexQuery.limit(limit).offset(offset).select('cash_point_closings.*');

  // get the final result
  const knexResult = await knexQuery;

  for (const row of knexResult) {
    row.closing_id = row.cash_point_closing_id;
    row.full_amount = row.payment_full_amount;
    row.cash_amount = row.payment_cash_amount;
    if (row.error_code)
      row.error = {
        code: row.error_code,
        message: row.error_message,
      };

    result.push(addStandardResponseProperties(row, 'CASH_POINT_CLOSING'));
  }

  return [result, count];
}

export async function getCashPointClosingsByExportIdMap(
  exportId: string,
  fromReadReplica = false,
): Promise<CashPointClosingEntityMap> {
  const knex = getKnex(fromReadReplica);
  const query = knex
    .from({ a: 'cash_point_closings' })
    .innerJoin(
      { b: 'export_cash_point_closings' },
      'a.cash_point_closing_id',
      'b.cash_point_closing_id',
    )
    .where('b.export_id', exportId);
  return knexMapStreamHandler(query.stream(), 'cash_point_closing_id');
}

export const insertCashPointClosing = async (
  closing: CashPointClosingEntity,
  logger,
  transaction?,
): Promise<void> => {
  let thisSql = sql;

  if (transaction) {
    thisSql = transaction;
  }

  closing.time_creation = new Date();
  closing.time_update = new Date();

  closing.metadata = sql.json(closing.metadata);

  // TODO perf. we could easily return the promise here
  await throwHttpErrorOnDbPromise(
    thisSql`
      INSERT INTO cash_point_closings
      ${thisSql(
        closing,
        'cash_point_closing_id',
        'cash_point_closing_export_id',
        'first_transaction_export_id',
        'last_transaction_export_id',
        'export_creation_date',
        'business_date',
        'client_id',
        'client_revision',
        'payment_full_amount',
        'payment_cash_amount',
        'env',
        'organization_id',
        'version',
        'metadata',
        'time_creation',
        'time_update',
        'state',
        'sign_api_version',
        'request_id',
      )}
    `,
    logger,
  );
};

export async function updateCashPointClosingMetadata(
  env: Env,
  closing_id: ClosingId,
  metadata: Metadata,
): Promise<CashPointClosingEntity> {
  const input = {
    metadata: metadata ? sql.json(metadata) : undefined,
  };
  // TODO perf. we could easily return the promise here
  const updatedCashPointClosing = await sql`
    UPDATE cash_point_closings 
    SET ${sql(input, 'metadata')}
    WHERE env = ${env}
    AND cash_point_closing_id = ${closing_id}
    RETURNING *
  `;

  return updatedCashPointClosing[0];
}

export async function setClosingError(
  closingId: string,
  errorCode: string,
  errorMessage: string,
  error: unknown,
  client_id?: string,
): Promise<CashPointClosingEntity | null> {
  const knex = getKnex();

  const updateObj = {
    state: 'ERROR',
    time_error: new Date(),
    error_code: errorCode,
    error_message: errorMessage,
    error_details: sql.json(error),
  };

  if (client_id) {
    updateObj['client_id'] = client_id;
  }
  const result = await knex('cash_point_closings')
    .where('cash_point_closing_id', closingId)
    .update(updateObj)
    .returning('*');

  return result[0] || null;
}

export async function setClosingState(
  closingId: string,
  state: OperationState,
  time_field: 'time_start' | 'time_end' | 'time_expiration' | 'time_error',
): Promise<CashPointClosingEntity | null> {
  // TODO perf. we could easily return the promise here
  const result = await sql`
    UPDATE cash_point_closings 
    SET state = ${state}, ${sql(time_field)} = NOW()
    WHERE cash_point_closing_id = ${closingId}
    RETURNING *
  `;
  return result[0] || null;
}

export async function setClosingStateToDeleted(
  closingId: string,
): Promise<CashPointClosingEntity | null> {
  const result = await sql`
    UPDATE cash_point_closings 
    SET state = 'DELETED', time_deleted = NOW(), time_update = NOW()
    WHERE cash_point_closing_id = ${closingId}
    RETURNING *
  `;
  return result[0] || null;
}
