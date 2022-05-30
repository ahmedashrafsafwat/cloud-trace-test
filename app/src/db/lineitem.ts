import { getKnex } from '.';
import { BusinessCaseType, Env, OrganizationId } from '../routes/api/models';
import {
  insertExternalReferences,
  ExternalReferenceInput,
} from './externalReferences';
import { selectPurchaserAgency } from './purchaserAgencies';
import { PurchaserAgencyNotFound } from '../lib/errors';
import {
  TransactionReferenceInput,
  insertTransactionReferences,
} from './transactionReferences';
import {
  LineitemEntity,
  SubitemEntity,
  AmountsPerVatIdEntity,
  LineitemInternalReferenceEntity,
} from '../models/db';
import { insertInternalLineitemReferences } from './internalLineitemReferences';
import { knexBatchInsert } from '../helpers/batchInsert';
import knexMapStreamHandler, { DataMap } from './knexMapStreamHandler';

export interface LineitemInput {
  lineitem_id: string;
  lineitem_export_id: string;
  transaction_id: string;
  business_case_type: BusinessCaseType;
  business_case_name?: string;
  purchaser_agency_id?: string;
  purchaser_agency_revision?: number;
  storno: boolean;
  text: string;
  in_house?: boolean;
  voucher_id?: string;
  item_number?: string;
  quantity?: number;
  price_per_unit?: number;
  gtin?: string;
  quantity_factor?: number;
  quantity_measure?: string;
  group_id?: string;
  group_name?: string;
  reference_transaction_id?: string;
  subItems?: SubitemEntity[];
  amountsPerVatId?: AmountsPerVatIdEntity[];
  transactionReferences: TransactionReferenceInput[];
  externalReferences: ExternalReferenceInput[];
  internalLineitemReferences: LineitemInternalReferenceEntity[];
  env: Env;
  organizationId: OrganizationId;
  cash_point_closing_id: string;
}

const insertSublineitems = async (
  sublineitem_input: SubitemEntity[],
  transaction?,
): Promise<void> => {
  await knexBatchInsert('subitems', sublineitem_input, transaction);
};

export const insertLineitems = async (
  lineitems_input: LineitemInput[],
  transaction?,
): Promise<void> => {
  const externalReferences: ExternalReferenceInput[] = [];
  const transactionReferences: TransactionReferenceInput[] = [];
  const internalLineitemReferences: LineitemInternalReferenceEntity[] = [];
  const subitemsInput: SubitemEntity[] = [];
  let purchaserAgencies = [];

  const purchaser_agency_ids = lineitems_input
    .map((x) => x.purchaser_agency_id)
    .filter((x) => x !== null && x !== undefined);

  const envs = lineitems_input.map((x) => x.env);
  const organizationIds = lineitems_input.map((x) => x.organizationId);

  if (purchaser_agency_ids.length && organizationIds.length) {
    purchaserAgencies = await selectPurchaserAgency(
      envs,
      organizationIds,
      purchaser_agency_ids,
    );
  }

  lineitems_input.forEach((lineitemInput, index) => {
    if (
      lineitemInput.purchaser_agency_id &&
      !lineitemInput.purchaser_agency_revision &&
      purchaserAgencies.length
    ) {
      const purchaserAgency = purchaserAgencies.filter(
        (x) =>
          x.env == lineitemInput.env &&
          x.organization_id == lineitemInput.organizationId &&
          x.purchaser_agency_id == lineitemInput.purchaser_agency_id,
      );
      if (purchaserAgency.length) {
        lineitems_input[index].purchaser_agency_revision =
          purchaserAgency[0].revision;
      } else {
        throw PurchaserAgencyNotFound();
      }
    }

    if (lineitemInput.externalReferences) {
      externalReferences.push(...lineitemInput.externalReferences);
    }
    if (lineitemInput.transactionReferences) {
      transactionReferences.push(...lineitemInput.transactionReferences);
    }
    if (lineitemInput.internalLineitemReferences) {
      internalLineitemReferences.push(
        ...lineitemInput.internalLineitemReferences,
      );
    }

    if (lineitemInput.subItems) {
      for (const item of lineitemInput.subItems) {
        subitemsInput.push({
          subitem_id: item.subitem_id,
          lineitem_id: item.lineitem_id,
          number: item.number,
          quantity: item.quantity,
          vat_definition_id: item.vat_definition_id,
          amount_excl_vat: item.amount_excl_vat,
          amount_incl_vat: item.amount_incl_vat,
          vat_amount: item.vat_amount,
          gtin: item.gtin,
          name: item.name,
          quantity_factor: item.quantity_factor,
          quantity_measure: item.quantity_measure,
          group_id: item.group_id,
          group_name: item.group_name,
          system_vat_definition_id: item.system_vat_definition_id,
          vat_definition_export_id: item.vat_definition_export_id,
          cash_point_closing_id: item.cash_point_closing_id,
        });
      }
    }

    delete lineitemInput.env;
    delete lineitemInput.organizationId;
    delete lineitemInput.externalReferences;
    delete lineitemInput.transactionReferences;
    delete lineitemInput.internalLineitemReferences;
    delete lineitemInput.subItems;
  });

  await knexBatchInsert('lineitems', lineitems_input, transaction);

  if (subitemsInput.length) {
    await insertSublineitems(subitemsInput, transaction);
  }
  if (externalReferences.length) {
    await insertExternalReferences(externalReferences, transaction);
  }
  if (transactionReferences.length) {
    await insertTransactionReferences(transactionReferences, transaction);
  }
  if (internalLineitemReferences.length) {
    await insertInternalLineitemReferences(
      internalLineitemReferences,
      transaction,
    );
  }
};

export async function selectLinesByExportIdMap(
  exportId: string,
  fromReadReplica = false,
): Promise<DataMap<LineitemEntity>> {
  const knex = getKnex(fromReadReplica);
  const query = knex
    .from({ l: 'lineitems' })
    .select(
      'l.lineitem_id',
      'l.lineitem_export_id',
      'l.transaction_id',
      'l.voucher_id',
      'l.text',
      'l.business_case_type',
      'l.business_case_name',
      'l.in_house',
      'l.storno',
      'l.item_number',
      'l.gtin',
      'l.group_id',
      'l.group_name',
      'l.price_per_unit',
      'l.cash_point_closing_id',
      'l.purchaser_agency_id',
      'l.purchaser_agency_revision',
      'l.quantity',
      'l.quantity_factor',
      'l.quantity_measure',
    )
    .innerJoin(
      { e: 'export_cash_point_closings' },
      'l.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId);
  return knexMapStreamHandler(query.stream(), 'lineitem_id');
}

export async function selectSubItemsByExportId(
  exportId: string,
  fromReadReplica = false,
): Promise<SubitemEntity[]> {
  const knex = getKnex(fromReadReplica);
  return knex
    .from({ s: 'subitems' })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      's.cash_point_closing_id',
      'e.cash_point_closing_id',
    )
    .where('e.export_id', exportId);
}
