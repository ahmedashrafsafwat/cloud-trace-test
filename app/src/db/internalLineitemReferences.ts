import { knexBatchInsert } from '../helpers/batchInsert';
import { LineitemInternalReferenceEntity } from '../models/db';

export async function insertInternalLineitemReferences(
  internalLineitemReferences: LineitemInternalReferenceEntity[],
  transaction?,
): Promise<void> {
  await knexBatchInsert(
    'lineitem_internal_references',
    internalLineitemReferences,
    transaction,
  );
}
