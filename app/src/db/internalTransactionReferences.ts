import { knexBatchInsert } from '../helpers/batchInsert';
import { TransactionInternalReferenceEntity } from '../models/db';

export async function insertInternalTransactionReferences(
  internalTransactionReferences: TransactionInternalReferenceEntity[],
  transaction?,
): Promise<void> {
  await knexBatchInsert(
    'transaction_internal_references',
    internalTransactionReferences,
    transaction,
  );
}
