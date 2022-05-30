import { getKnex } from '.';
import {
  TransactionReferenceInput,
  insertTransactionReferences,
} from './transactionReferences';
import {
  ExternalReferenceInput,
  insertExternalReferences,
} from './externalReferences';
import { insertInternalTransactionReferences } from './internalTransactionReferences';
import {
  TransactionEntity,
  TransactionInternalReferenceEntity,
} from '../models/db';
import { TransactionsCsv } from '../models/dsfinvk';
import { logTime } from '../lib/metrics';
import knexMapStreamHandler from './knexMapStreamHandler';
import { knexBatchInsert } from '../helpers/batchInsert';

export interface TransactionInput extends TransactionEntity {
  transactionReferences: TransactionReferenceInput[];
  externalReferences: ExternalReferenceInput[];
  internalTransactionReferences: TransactionInternalReferenceEntity[];
}

export interface TransactionInclAllocationCsv extends TransactionsCsv {
  ABRECHNUNGSKREIS: string[];
  tse_tx_id: string | null;
  error_message: string | null;
}

export async function selectTransactionsByExportMap(
  exportId: string,
  readFromReplica = false,
) {
  const knex = getKnex(readFromReplica);
  const query = knex
    .select('t.*')
    .from({ t: 'transactions' })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      't.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId);
  return knexMapStreamHandler<TransactionEntity>(
    query.stream(),
    'transaction_id',
  );
}

export async function selectTSETransactionId(
  exportId: string,
): Promise<string[]> {
  const time = logTime('selectTSETransactionId');

  const transactionIds: string[] = [];
  const knex = getKnex();

  const stream = knex
    .select('t.tse_tx_id')
    .from({ t: 'transactions' })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      't.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId)
    .whereNotNull('tse_tx_id')
    .stream();

  transactionIds.push(
    ...Object.keys(await knexMapStreamHandler(stream, 'tse_tx_id')),
  );

  await time.end();

  return transactionIds;
}

export const insertTransactions = async (
  transaction_input: TransactionInput[],
  transaction?,
): Promise<void> => {
  const externalReferences: ExternalReferenceInput[] = [];
  const transactionReferences: TransactionReferenceInput[] = [];
  const internalTransactionReferences: TransactionInternalReferenceEntity[] =
    [];

  transaction_input.forEach((transaction, index) => {
    transaction_input[index].buyer = transaction.buyer || null;
    transaction_input[index].allocation_groups = transaction.allocation_groups
      ? JSON.stringify(transaction.allocation_groups)
      : null;

    if (transaction.externalReferences) {
      externalReferences.push(...transaction.externalReferences);
    }
    if (transaction.transactionReferences) {
      transactionReferences.push(...transaction.transactionReferences);
    }
    if (transaction.internalTransactionReferences) {
      internalTransactionReferences.push(
        ...transaction.internalTransactionReferences,
      );
    }
    delete transaction.externalReferences;
    delete transaction.transactionReferences;
    delete transaction.internalTransactionReferences;
  });

  await knexBatchInsert('transactions', transaction_input, transaction);

  if (externalReferences.length) {
    await insertExternalReferences(externalReferences, transaction);
  }
  if (transactionReferences.length) {
    await insertTransactionReferences(transactionReferences, transaction);
  }
  if (internalTransactionReferences.length) {
    await insertInternalTransactionReferences(
      internalTransactionReferences,
      transaction,
    );
  }
};
