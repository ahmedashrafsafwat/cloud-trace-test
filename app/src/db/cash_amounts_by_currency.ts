// TODO Perf check if all those awaits are needed!

import { getKnex } from '.';
import { CashAmountsByCurrencyEntity } from '../models/db';
import { knexBatchInsert } from '../helpers/batchInsert';

export const insertCashAmountsByCurrency = async (
  cash_amounts: CashAmountsByCurrencyEntity[],
): Promise<void> => {
  await knexBatchInsert('cash_amounts_by_currency', cash_amounts, null);
};

export async function selectCashAmountsPerCurrencyByExportId(
  exportId: string,
  readFromReplica = false,
): Promise<CashAmountsByCurrencyEntity[]> {
  const knex = getKnex(readFromReplica);
  return knex
    .select('a.currency_code', 'a.amount', 'a.cash_point_closing_id')
    .from({ a: 'cash_amounts_by_currency' })
    .innerJoin(
      { c: 'export_cash_point_closings' },
      'a.cash_point_closing_id',
      'c.cash_point_closing_id',
    )
    .where('c.export_id', exportId);
}
