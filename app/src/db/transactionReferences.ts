import { knexBatchInsert } from '../helpers/batchInsert';

export interface TransactionReferenceInput {
  transaction_reference_id: string;
  transaction_id: string;
  lineitem_id: string | null;
  entry_type: 'transaction' | 'lineitem';
  cash_point_closing_export_id: number;
  cash_register_id: string;
  transaction_export_id: string;
  date: Date | null;
}

export async function insertTransactionReferences(
  transactionReferences: TransactionReferenceInput[],
  transaction?,
): Promise<void> {
  await knexBatchInsert(
    'transaction_references',
    transactionReferences,
    transaction,
  );
}
