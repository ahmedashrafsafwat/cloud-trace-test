// TODO Perf check if all those awaits are needed!

import { getKnex } from '../db';
import { insertAmountsPerVatId } from './amountsPerVatIds';
import { BusinessCaseEntity, AmountsPerVatIdEntity } from '../models/db';
import { knexBatchInsert } from '../helpers/batchInsert';
import knexMapStreamHandler, { DataMap } from './knexMapStreamHandler';

export interface BusinessCaseInput extends BusinessCaseEntity {
  amountsPerVatId: AmountsPerVatIdEntity[];
}

export interface BusinessCaseEntityWithAmountsPerVat
  extends BusinessCaseEntity {
  incl_vat?: string;
  excl_vat?: string;
  vat?: string;
  vat_definition_id: string;
  system_vat_definition_id: string;
}

export async function selectBusinessCasesMapByExportId(
  exportId: string,
  readFromReplica = false,
): Promise<DataMap<BusinessCaseEntity>> {
  const knex = getKnex(readFromReplica);
  const stream = knex
    .from({ bc: 'business_cases' })
    .innerJoin(
      { e: 'export_cash_point_closings' },
      'e.cash_point_closing_id',
      'bc.cash_point_closing_id',
    )
    .where('e.export_id', exportId)
    .stream();
  return knexMapStreamHandler<BusinessCaseEntity>(stream, 'business_case_id');
}

export async function insertBusinessCases(
  businessCases: BusinessCaseInput[],
  transaction?,
): Promise<void> {
  const amountsPerVatId: AmountsPerVatIdEntity[] = [];

  businessCases.forEach((businessCase) => {
    if (businessCase.amountsPerVatId.length) {
      amountsPerVatId.push(...businessCase.amountsPerVatId);
    }
    delete businessCase.amountsPerVatId;
  });

  await knexBatchInsert('business_cases', businessCases, transaction);

  if (amountsPerVatId.length) {
    await insertAmountsPerVatId(amountsPerVatId, transaction);
  }
}
