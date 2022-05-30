import { knexBatchInsert } from '../helpers/batchInsert';

// TODO: Swap with interface ExternalReferenceEntity found in db.d.ts
export interface ExternalReferenceInput {
  external_reference_id: string;
  transaction_id: string;
  lineitem_id: string | null;
  entry_type: 'transaction' | 'lineitem';
  type: 'ExterneRechnung' | 'ExternerLieferschein' | 'ExterneSonstige';
  external_reference_export_id: string;
  name: string | null;
  date: Date | null;
  cash_point_closing_id: string;
}

export async function insertExternalReferences(
  externalReferences: ExternalReferenceInput[],
  transaction?,
): Promise<void> {
  await knexBatchInsert('external_references', externalReferences, transaction);
}
