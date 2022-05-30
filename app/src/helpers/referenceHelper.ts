import { TransactionReferenceInput } from '../db/transactionReferences';
import { ExternalReferenceInput } from '../db/externalReferences';
import { v4 as uuidv4 } from 'uuid';
import {
  TransactionInternalReferenceEntity,
  ExternalReferenceEntity,
  TransactionReferenceEntity,
  LineitemInternalReferenceEntity,
} from '../models/db';
import { Reference } from '../routes/api/models';
import { ReferencesCsv } from '../models/dsfinvk';
import sql from '../db';
import { logTime } from '../lib/metrics';

export interface ReferenceType1 {
  type: 'ExterneRechnung' | 'ExternerLieferschein';
  date?: number;
  external_export_id: string;
}

export interface ReferenceType2 {
  type: 'ExterneSonstige';
  name: string;
  date?: number;
  external_other_export_id: string;
}

export interface ReferenceType3 {
  type: 'Transaktion';
  date?: number;
  cash_point_closing_export_id: number;
  cash_register_export_id: string;
  transaction_export_id: string;
}

export interface ReferenceType4 {
  type: 'InterneTransaktion';
  tx_id: string;
}

export function prepareTransactionReferences(
  references: ReferenceType3[],
  entry_type: 'transaction' | 'lineitem',
  transaction_id: string,
  lineitem_id: string | null,
): TransactionReferenceInput[] {
  const transactionReferences: TransactionReferenceInput[] = [];

  for (const reference of references) {
    const transactionReference: TransactionReferenceInput = {
      transaction_reference_id: uuidv4(),
      transaction_id,
      lineitem_id,
      entry_type,
      cash_point_closing_export_id: reference.cash_point_closing_export_id,
      cash_register_id: reference.cash_register_export_id,
      transaction_export_id: reference.transaction_export_id,
      date: reference.date ? new Date(reference.date * 1000) : null,
    };

    transactionReferences.push(transactionReference);
  }

  return transactionReferences;
}

export function prepareInternalTransactionReferences(
  references: ReferenceType4[],
  transaction_id: string,
): TransactionInternalReferenceEntity[] {
  const internalTransactionReferences: TransactionInternalReferenceEntity[] =
    [];

  for (const reference of references) {
    const internalTransactionReference: TransactionInternalReferenceEntity = {
      transaction_id,
      // TODO: The referenced_transaction_id should be the referenced DSFinV-K transaction_id and not the sign API tx_id
      referenced_transaction_id: reference.tx_id,
      cash_point_closing_id: null,
      referenced_cash_point_closing_id: null,
    };

    internalTransactionReferences.push(internalTransactionReference);
  }

  return internalTransactionReferences;
}

export function prepareInternalLineitemReferences(
  references: ReferenceType4[],
  lineitem_id: string,
): LineitemInternalReferenceEntity[] {
  const internalLineitemReferences: LineitemInternalReferenceEntity[] = [];

  for (const reference of references) {
    const internalLineitemReference: LineitemInternalReferenceEntity = {
      lineitem_id,
      referenced_transaction_id: reference.tx_id,
    };

    internalLineitemReferences.push(internalLineitemReference);
  }

  return internalLineitemReferences;
}

export function prepareExternalReferences(
  references: (ReferenceType1 | ReferenceType2)[],
  entry_type: 'transaction' | 'lineitem',
  cash_point_closing_id: string,
  transaction_id: string,
  lineitem_id: string | null,
): ExternalReferenceInput[] {
  const externalReferences: ExternalReferenceInput[] = [];

  for (const reference of references) {
    const externalReference: ExternalReferenceInput = {
      external_reference_id: uuidv4(),
      external_reference_export_id:
        reference.type === 'ExterneSonstige'
          ? reference.external_other_export_id
          : reference.external_export_id,
      transaction_id,
      lineitem_id,
      entry_type,
      type: reference.type,
      name: reference.type === 'ExterneSonstige' ? reference.name : null,
      date: reference.date ? new Date(reference.date) : null,
      cash_point_closing_id: cash_point_closing_id,
    };

    externalReferences.push(externalReference);
  }

  return externalReferences;
}

export function mapToReferences(
  input: (
    | ExternalReferenceEntity
    | TransactionReferenceEntity
    | TransactionInternalReferenceEntity
    | LineitemInternalReferenceEntity
  )[],
): [Reference, ...Reference[]] | undefined {
  const references: Reference[] = [];

  for (const ref of input) {
    if (ref !== null) {
      if (
        ref.hasOwnProperty('type') &&
        ref.hasOwnProperty('external_reference_id')
      ) {
        const externalRef = ref as ExternalReferenceEntity;

        if (
          externalRef.type === 'ExterneRechnung' ||
          externalRef.type === 'ExternerLieferschein'
        ) {
          const reference: Reference = {
            type: externalRef.type,
            date: externalRef.date
              ? Math.floor(externalRef.date.getTime() / 1000)
              : undefined,
            external_export_id: externalRef.external_reference_export_id,
          };

          references.push(reference);
        } else if (externalRef.type === 'ExterneSonstige') {
          const reference: Reference = {
            tx_id: externalRef.transaction_id,
            type: externalRef.type,
            name: externalRef.name,
            date: externalRef.date
              ? Math.floor(externalRef.date.getTime() / 1000)
              : undefined,
            external_other_export_id: externalRef.external_reference_export_id,
          };

          references.push(reference);
        }
      } else if (
        ref.hasOwnProperty('entry_type') &&
        ref.hasOwnProperty('cash_point_closing_export_id')
      ) {
        const externalRef = ref as TransactionReferenceEntity;

        const reference: Reference = {
          tx_id: externalRef.transaction_id,
          type: 'Transaktion',
          date: externalRef.date
            ? Math.floor(externalRef.date.getTime() / 1000)
            : undefined,
          cash_point_closing_export_id:
            externalRef.cash_point_closing_export_id,
          cash_register_export_id: externalRef.cash_register_id,
          transaction_export_id: externalRef.transaction_export_id,
        };

        references.push(reference);
      } else if (ref.hasOwnProperty('referenced_transaction_id')) {
        const externalRef = ref as TransactionInternalReferenceEntity;

        const reference: Reference = {
          type: 'InterneTransaktion',
          tx_id: externalRef.referenced_transaction_id,
        };

        references.push(reference);
      }
    }
  }

  return references.length
    ? (references as [Reference, ...Reference[]])
    : undefined;
}

// TODO Perf: get rid of this query-BEAST! It might be simplified drastically, once we know what and why it does what it does.
export async function selectReferencesByExportId(
  exportId: string,
  sqlClient = sql,
): Promise<ReferencesCsv[]> {
  const selectReferencesByExportIdTime = logTime('selectReferencesByExportId');
  const result = await sqlClient`
    SELECT
      c.client_id AS "Z_KASSE_ID",
      to_char(c.export_creation_date::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "Z_ERSTELLUNG",
      c.cash_point_closing_export_id AS "Z_NR",
      t.transaction_export_id AS "BON_ID",
      li.lineitem_export_id AS "POS_ZEILE",
      'Transaktion' AS "REF_TYP",
      NULL AS "REF_NAME",
      to_char(tr.date::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "REF_DATUM",
      tr.cash_register_id AS "REF_Z_KASSE_ID",
      tr.cash_point_closing_export_id AS "REF_Z_NR",
      tr.transaction_export_id AS "REF_BON_ID"
    FROM
      transaction_references tr
      LEFT JOIN lineitems li ON tr.lineitem_id = li.lineitem_id
      INNER JOIN transactions t ON tr.transaction_id = t.transaction_id
      INNER JOIN cash_point_closings c ON t.cash_point_closing_id = c.cash_point_closing_id
      INNER JOIN export_cash_point_closings e ON c.cash_point_closing_id = e.cash_point_closing_id
    WHERE
      e.export_id = ${exportId}
    UNION
    SELECT
      c1.client_id AS "Z_KASSE_ID",
      to_char(c1.export_creation_date::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "Z_ERSTELLUNG",
      c1.cash_point_closing_export_id AS "Z_NR",
      t1.transaction_export_id AS "BON_ID",
      NULL AS "POS_ZEILE",
      'Transaktion' AS "REF_TYP",
      NULL AS "REF_NAME",
      to_char(t2.timestamp_end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "REF_DATUM",
      t2.closing_client_id::text AS "REF_Z_KASSE_ID",
      c2.cash_point_closing_export_id AS "REF_Z_NR",
      t2.transaction_export_id AS "REF_BON_ID"
    FROM
      transaction_internal_references tir
      INNER JOIN transactions t1 ON tir.transaction_id = t1.transaction_id
      INNER JOIN transactions t2 ON tir.referenced_transaction_id = t2.transaction_id
      INNER JOIN cash_point_closings c2 ON t2.cash_point_closing_id = c2.cash_point_closing_id
      INNER JOIN cash_point_closings c1 ON t1.cash_point_closing_id = c1.cash_point_closing_id
      INNER JOIN export_cash_point_closings e ON c1.cash_point_closing_id = e.cash_point_closing_id
    WHERE
      e.export_id = ${exportId}
    UNION
    SELECT
      c1.client_id AS "Z_KASSE_ID",
      to_char(c1.export_creation_date::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "Z_ERSTELLUNG",
      c1.cash_point_closing_export_id AS "Z_NR",
      t1.transaction_export_id AS "BON_ID",
      li.lineitem_export_id AS "POS_ZEILE",
      'Transaktion' AS "REF_TYP",
      NULL AS "REF_NAME",
      to_char(t2.timestamp_end::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "REF_DATUM",
      t2.closing_client_id::text AS "REF_Z_KASSE_ID",
      c2.cash_point_closing_export_id AS "REF_Z_NR",
      t2.transaction_export_id AS "REF_BON_ID"
    FROM
      lineitem_internal_references lir
      INNER JOIN lineitems li ON lir.lineitem_id = li.lineitem_id
      INNER JOIN transactions t1 ON li.transaction_id = t1.transaction_id
      INNER JOIN transactions t2 ON lir.referenced_transaction_id = t2.transaction_id
      INNER JOIN cash_point_closings c2 ON t2.cash_point_closing_id = c2.cash_point_closing_id
      INNER JOIN cash_point_closings c1 ON t1.cash_point_closing_id = c1.cash_point_closing_id
      INNER JOIN export_cash_point_closings e ON c1.cash_point_closing_id = e.cash_point_closing_id
    WHERE
      e.export_id = ${exportId}
    UNION
    SELECT
      c.client_id AS "Z_KASSE_ID",
      to_char(c.export_creation_date::timestamp at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "Z_ERSTELLUNG",
      c.cash_point_closing_export_id AS "Z_NR",
      t.transaction_export_id AS "BON_ID",
      li.lineitem_export_id AS "POS_ZEILE",
      er.type::text AS "REF_TYP",
      er.name AS "REF_NAME",
      NULL AS "REF_DATUM",
      NULL AS "REF_Z_KASSE_ID",
      NULL AS "REF_Z_NR",
      er.external_reference_export_id AS "REF_BON_ID"
    FROM
      external_references er
      INNER JOIN transactions t ON er.transaction_id = t.transaction_id
      LEFT JOIN lineitems li ON er.lineitem_id = li.lineitem_id
      INNER JOIN cash_point_closings c ON t.cash_point_closing_id = c.cash_point_closing_id
      INNER JOIN export_cash_point_closings e ON c.cash_point_closing_id = e.cash_point_closing_id
    WHERE
      e.export_id = ${exportId};
  `;
  await selectReferencesByExportIdTime.end();

  return result;
}
