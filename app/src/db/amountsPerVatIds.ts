import { getKnex } from '../db';
import { AmountsPerVatIdEntity } from '../models/db';
import { knexBatchInsert } from '../helpers/batchInsert';

export async function selectAllAmountsPerVatIdsByExportId(
  exportId: string,
  fromReadReplica = false,
): Promise<AmountsPerVatIdEntity[]> {
  const knex = getKnex(fromReadReplica);
  return knex
    .from({ a: 'amounts_per_vat_ids' })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      'a.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId);
}

export async function insertAmountsPerVatId(
  amountsPerVatIds: AmountsPerVatIdEntity[],
  transaction?,
): Promise<void> {
  await knexBatchInsert('amounts_per_vat_ids', amountsPerVatIds, transaction);
}
