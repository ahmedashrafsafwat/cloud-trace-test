import { getKnex } from '../db';

const MAX_UPDATES = 200;
const MAX_REF_ENTITIES = 20;

async function waitTillIndexesUpdated() {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

export async function getTransactionIds(cash_point_closing_id) {
  const knex = getKnex();

  return (
    await knex('transactions')
      .select('transaction_id')
      .where('cash_point_closing_id', cash_point_closing_id)
  ).map((entity) => entity.transaction_id);
}

async function migrationRunner(
  entities: any[],
  updateCallback: (slicedEntities: any[]) => Promise<number>,
) {
  for (let i = 0; i < entities.length; i += MAX_REF_ENTITIES) {
    const slicedEntities = entities.slice(i, i + MAX_REF_ENTITIES);
    while (true) {
      const updateCount = await updateCallback(slicedEntities);
      if (updateCount < MAX_UPDATES) {
        break;
      }
      await waitTillIndexesUpdated();
    }
  }
}

export async function migrateAmountsPerVatIdsViaBusinessCase(
  cash_point_closing_id,
) {
  const knex = getKnex();

  const businessCaseIds = (
    await knex('business_cases')
      .select('business_case_id')
      .where('cash_point_closing_id', cash_point_closing_id)
  ).map((entity) => entity.business_case_id);

  await migrationRunner(businessCaseIds, async (slicedBusinessCaseIds) => {
    return knex('amounts_per_vat_ids')
      .update({ cash_point_closing_id })
      .whereIn(
        'amounts_per_vat_id',
        knex('amounts_per_vat_ids')
          .select('amounts_per_vat_id')
          .whereIn('business_case_id', slicedBusinessCaseIds)
          .whereNull('cash_point_closing_id')
          .limit(MAX_UPDATES),
      );
  });
}

export async function migrateAmountsPerVatIdsViaTransaction(
  cash_point_closing_id,
  transactionIds,
) {
  const knex = getKnex();
  await migrationRunner(transactionIds, async (slicedTransactionIds) => {
    return knex('amounts_per_vat_ids')
      .update({ cash_point_closing_id })
      .whereIn(
        'amounts_per_vat_id',
        knex('amounts_per_vat_ids')
          .select('amounts_per_vat_id')
          .whereIn('transaction_id', slicedTransactionIds)
          .whereNull('cash_point_closing_id')
          .limit(MAX_UPDATES),
      );
  });
}

export async function migrateAmountsPerVatIdsViaLineitem(
  cash_point_closing_id,
) {
  const knex = getKnex();
  const lineItemIds = (
    await knex('lineitems')
      .select('lineitem_id')
      .where('cash_point_closing_id', cash_point_closing_id)
  ).map((entity) => entity.lineitem_id);
  await migrationRunner(lineItemIds, async (slicedLineItemIds) => {
    return knex('amounts_per_vat_ids')
      .update({ cash_point_closing_id })
      .whereIn(
        'amounts_per_vat_id',
        knex('amounts_per_vat_ids')
          .select('amounts_per_vat_id')
          .whereIn('lineitem_id', slicedLineItemIds)
          .whereNull('cash_point_closing_id')
          .limit(MAX_UPDATES),
      );
  });
}

export async function migratePaymentTypesViaTransaction(
  cash_point_closing_id,
  transactionIds,
) {
  const knex = getKnex();
  await migrationRunner(transactionIds, async (slicedTransactionIds) => {
    return knex('payment_types')
      .update({ cash_point_closing_id })
      .whereIn(
        'payment_type_id',
        knex('payment_types')
          .select('payment_type_id')
          .whereIn('transaction_id', slicedTransactionIds)
          .whereNull('cash_point_closing_id')
          .andWhere('entry_type', 'transaction')
          .limit(MAX_UPDATES),
      );
  });
}

export async function migrateExternalReferencesViaTransaction(
  cash_point_closing_id,
  transactionIds,
) {
  const knex = getKnex();
  await migrationRunner(transactionIds, async (slicedTransactionIds) => {
    return knex('external_references')
      .update({ cash_point_closing_id })
      .whereIn(
        'external_reference_id',
        knex('external_references')
          .select('external_reference_id')
          .whereIn('transaction_id', slicedTransactionIds)
          .whereNull('cash_point_closing_id')
          .limit(MAX_UPDATES),
      );
  });
}
