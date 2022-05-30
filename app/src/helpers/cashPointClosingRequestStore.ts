import {
  ClosingId,
  OrganizationId,
  Env,
  CashPointClosing,
} from '../routes/api/models';
import { Knex } from 'knex';
import { getKnex } from '../db';
import { setClosingState } from '../db/closing';
import secureJSON from 'secure-json-parse';
import { logTime } from '../lib/metrics';

export interface CashPointClosingRequest {
  closing_id: ClosingId;
  organization_id: OrganizationId;
  request_body: CashPointClosing;
  env: Env;
}

export async function insertCashPointClosingRequest(
  closing_id: ClosingId,
  organization_id: OrganizationId,
  requestBody: CashPointClosing,
  env: Env,
) {
  const insertCashPointClosingRequestTime = logTime(
    'insertCashPointClosingRequest',
  );
  const knex = getKnex();
  await knex('cash_point_closing_requests').insert({
    closing_id,
    organization_id,
    request_body: requestBody,
    time_creation: new Date(),
    env,
  });
  await insertCashPointClosingRequestTime.end();
}

export async function getCashPointClosingRequest(
  closing_id: ClosingId,
): Promise<CashPointClosingRequest> {
  const knex = getKnex();
  const getCashPointClosingRequestTime = logTime('getCashPointClosingRequest');
  const request = await knex
    .from('cash_point_closing_requests')
    .where({ closing_id })
    .first();
  await getCashPointClosingRequestTime.end();

  if (!request) {
    return;
  }

  const request_body =
    request.request_body && secureJSON.safeParse(request.request_body);
  // secure-json-parse won't raise an error here.
  if (request_body == null) {
    throw new SyntaxError('Invalid syntax in request body');
  }

  return {
    ...request,
    request_body,
  };
}

export async function resetCashPointClosing(closing_id: ClosingId) {
  const knex = getKnex();
  try {
    await knex.transaction(async (trx: Knex.Transaction) => {
      let lineitem_ids = [];
      await deleteCashPointClosingPartial(
        'cash_amounts_by_currency',
        'cash_point_closing_id',
        closing_id,
        trx,
      );
      await deleteCashPointClosingPartial(
        'business_cases',
        'cash_point_closing_id',
        closing_id,
        trx,
      );
      await deleteCashPointClosingPartial(
        'payment_types',
        'cash_point_closing_id',
        closing_id,
        trx,
      );
      const transaction_ids = await deleteCashPointClosingPartial(
        'transactions',
        'cash_point_closing_id',
        closing_id,
        trx,
        'transaction_id',
      );

      if (transaction_ids.length) {
        await deleteCashPointClosingPartial(
          'external_references',
          'transaction_id',
          transaction_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'transaction_references',
          'transaction_id',
          transaction_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'transaction_internal_references',
          'transaction_id',
          transaction_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'transaction_internal_references',
          'transaction_id',
          transaction_ids,
          trx,
        );

        await deleteCashPointClosingPartial(
          'payment_types',
          'transaction_id',
          transaction_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'amount_per_vat_id',
          'transaction_id',
          transaction_ids,
          trx,
        );
        lineitem_ids = await deleteCashPointClosingPartial(
          'lineitems',
          'transaction_id',
          transaction_ids,
          trx,
          'lineitem_id',
        );
      }

      if (lineitem_ids.length) {
        await deleteCashPointClosingPartial(
          'transaction_references',
          'lineitem_id',
          lineitem_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'external_references',
          'lineitem_id',
          lineitem_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'subitems',
          'lineitem_id',
          lineitem_ids,
          trx,
        );
        await deleteCashPointClosingPartial(
          'lineitem_internal_references',
          'lineitem_id',
          lineitem_ids,
          trx,
        );
      }
    });

    await setClosingState(closing_id, 'PENDING', 'time_start');
  } catch (err) {
    throw Error('Unknown error.');
  }
}

// delete cash point closing inserts transactions
async function deleteCashPointClosingPartial(
  table_name,
  col_name,
  col_value,
  trx,
  get_column?,
) {
  try {
    const knex = getKnex();
    let result = [];
    if (get_column) {
      result = await knex
        .select(get_column)
        .from(table_name)
        .where(col_name, col_value);
    }
    const query = knex(table_name);
    Array.isArray(col_value)
      ? query.whereIn(col_name, col_value)
      : query.where(col_name, col_value);

    await query.del().transacting(trx);

    return result;
  } catch (err) {
    console.error(err);
    throw Error('Unknown error.');
  }
}
