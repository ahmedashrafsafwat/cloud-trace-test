import { getKnex } from '.';
import { PaymentTypeEntity } from '../models/db';
import { knexBatchInsert } from '../helpers/batchInsert';
import knexMapStreamHandler from './knexMapStreamHandler';

export async function selectPaymentTypesByExportIdMap(
  exportId: string,
  readFromReplica = false,
) {
  const knex = getKnex(readFromReplica);
  const query = knex
    .from({ pt: 'payment_types' })
    .select('pt.*')
    .innerJoin(
      { e: 'export_cash_point_closings' },
      'pt.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId);
  return knexMapStreamHandler<PaymentTypeEntity>(
    query.stream(),
    'payment_type_id',
  );
}

export const insertPaymentTypes = async (
  payment_types: PaymentTypeEntity[],
  transaction?,
): Promise<void> => {
  await knexBatchInsert('payment_types', payment_types, transaction);
};
