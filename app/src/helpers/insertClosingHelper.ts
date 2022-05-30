import { Knex } from 'knex';
import { getVatDefinitions } from '../db/vatDefinitions';
import { getKnex } from '../db';
import {
  OrganizationId,
  Env,
  CashStatement,
  ClosingId,
  Transaction,
  ClientId,
  SignApiVersionType,
} from '../routes/api/models';
import { insertCashAmountsByCurrency } from '../db/cash_amounts_by_currency';
import { BusinessCaseInput, insertBusinessCases } from '../db/businessCases';
import { v4 as uuidv4 } from 'uuid';
import {
  PurchaserAgencieEntity,
  AmountsPerVatIdEntity,
  PaymentTypeEntity,
  SubitemEntity,
  CashPointClosingEntity,
} from '../models/db';
import { selectPurchaserAgency } from '../db/purchaserAgencies';
import {
  PurchaserAgencyNotFound,
  VatDefinitionNotFound,
  CashRegisterNotFound,
} from '../lib/errors';
import { insertPaymentTypes } from '../db/payment_types';
import { LineitemInput, insertLineitems } from '../db/lineitem';
import { TransactionInput, insertTransactions } from '../db/transaction';
import {
  selectCashRegister,
  selectCashRegisterByDate,
} from '../db/cash_register';
import {
  prepareExternalReferences,
  ReferenceType1,
  ReferenceType2,
  prepareTransactionReferences,
  ReferenceType3,
  prepareInternalTransactionReferences,
  ReferenceType4,
  prepareInternalLineitemReferences,
} from './referenceHelper';
import { insertAmountsPerVatId } from '../db/amountsPerVatIds';
import { selectCashPointClosing } from '../db/closing';
import { getUnixTime } from 'date-fns';
import VatDefinitionPicker from './vatDefinitionPicker';

interface Input {
  closing_id: ClosingId;
  client_id: ClientId;
  token_env: Env;
  organizationId: OrganizationId;
  cash_statement: CashStatement;
  transactions: Transaction[];
  sign_api_version: SignApiVersionType;
}

export const insertClosingData = async (
  {
    token_env,
    organizationId,
    cash_statement,
    closing_id,
    client_id,
    transactions,
    sign_api_version,
  }: Input,
  useClosing?: CashPointClosingEntity,
) => {
  try {
    const knex = getKnex();
    await knex.transaction(async (trx: Knex.Transaction) => {
      const closing =
        useClosing && useClosing.cash_point_closing_id === closing_id
          ? useClosing
          : await selectCashPointClosing(token_env, organizationId, closing_id);
      if (closing == null) {
        throw new Error(`CashPointClosing ${closing_id} not found`);
      }

      const allVatDefinitions = await getVatDefinitions(
        organizationId,
        token_env,
      );
      const vatDefinitionPicker = new VatDefinitionPicker(allVatDefinitions);

      let usedDate: Date = closing.export_creation_date;
      if (closing.business_date) {
        closing.business_date.setHours(23, 59, 59);
        usedDate = closing.business_date;
      }
      const cashRegister = await selectCashRegisterByDate(
        token_env,
        organizationId,
        client_id,
        getUnixTime(usedDate),
      );

      if (
        cash_statement.payment &&
        cash_statement.payment.cash_amounts_by_currency
      ) {
        const filteredCashAmountsByCurrency =
          cash_statement.payment.cash_amounts_by_currency.map(
            (cash_amount) => ({
              currency_code: cash_amount.currency_code,
              amount: cash_amount.amount,
              cash_point_closing_id: closing_id,
            }),
          );
        // TODO Perf: check if there is a reason for await here? Seems like it doesn't matter _when_ it is inserted.
        await insertCashAmountsByCurrency(filteredCashAmountsByCurrency);
      }

      if (cash_statement.business_cases) {
        let purchaserAgencies: PurchaserAgencieEntity[] | null = null;
        // get purchaser_agency ids and remove nulls
        const purchaser_agency_ids = cash_statement.business_cases
          .map((businessCase) => businessCase.purchaser_agency_id)
          .filter((x) => x !== null && x !== undefined);

        if (purchaser_agency_ids.length) {
          purchaserAgencies = await selectPurchaserAgency(
            token_env,
            organizationId,
            purchaser_agency_ids,
            null,
            sign_api_version,
          );

          if (!purchaserAgencies) {
            throw PurchaserAgencyNotFound();
          }
        }

        const businessCaseInput: BusinessCaseInput[] = [];
        // TODO: enhancing the nest loop to O(n)
        for (const businessCase of cash_statement.business_cases) {
          const businessCaseId = uuidv4();

          const purchaser_agencies_found = purchaserAgencies
            ? purchaserAgencies.filter(
                (x) =>
                  x.purchaser_agency_id == businessCase.purchaser_agency_id,
              )
            : null;

          const current_purchaser_agency =
            Array.isArray(purchaser_agencies_found) &&
            purchaser_agencies_found.length
              ? purchaser_agencies_found[0]
              : null;

          businessCaseInput.push({
            business_case_id: businessCaseId,
            cash_point_closing_id: closing_id,
            type: businessCase.type,
            name: businessCase.name || null,
            purchaser_agency_id: current_purchaser_agency
              ? current_purchaser_agency.purchaser_agency_id
              : null,
            purchaser_agency_revision: current_purchaser_agency
              ? current_purchaser_agency.revision
              : null,
            amountsPerVatId: businessCase.amounts_per_vat_id.map(
              (amountPerVatId) => {
                const vatDefinition =
                  vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                    amountPerVatId.vat_definition_export_id,
                    usedDate,
                  );
                if (!vatDefinition) {
                  throw VatDefinitionNotFound(
                    amountPerVatId.vat_definition_export_id,
                  );
                }

                const amountsPerVatIdInput: AmountsPerVatIdEntity = {
                  amounts_per_vat_id: uuidv4(),
                  entry_type: 'business_case',
                  lineitem_id: null,
                  transaction_id: null,
                  business_case_id: businessCaseId,
                  excl_vat: amountPerVatId.excl_vat,
                  incl_vat: amountPerVatId.incl_vat,
                  vat: amountPerVatId.vat,
                  vat_definition_id:
                    vatDefinition.vat_definition_export_id >= 1000
                      ? vatDefinition.vat_definition_id
                      : null,
                  system_vat_definition_id:
                    vatDefinition.vat_definition_export_id < 1000
                      ? vatDefinition.vat_definition_id
                      : null,
                  vat_definition_export_id:
                    amountPerVatId.vat_definition_export_id,
                  cash_point_closing_id: closing_id,
                };

                return amountsPerVatIdInput;
              },
            ),
          });
        }

        // TODO Perf: make async + push to promise pool for error handling!
        await insertBusinessCases(businessCaseInput, trx);
      }

      if (cash_statement.payment && cash_statement.payment.payment_types) {
        // TODO: add check if currency_code is not equal to base_currency_code of cash register foreign amount is mandatory
        // TODO Perf: make async!
        await insertPaymentTypes(
          cash_statement.payment.payment_types.map((input) => ({
            payment_type_id: uuidv4(),
            transaction_id: null,
            cash_point_closing_id: closing_id,
            entry_type: 'cash_point_closing',
            type: input.type,
            currency_code: input.currency_code,
            amount: input.amount,
            name: input.name || null,
            foreign_amount: input.foreign_amount || null,
          })),
          trx,
        );
      }

      if (transactions) {
        const lineitemsInput: LineitemInput[] = [];
        const transactionPaymentTypesInput: PaymentTypeEntity[] = [];
        const transactionAmounts: AmountsPerVatIdEntity[] = [];
        const transactionInputs: TransactionInput[] = [];

        // select cash registers by closing client ids
        const closing_client_ids = transactions.map(
          (x) => x.head.closing_client_id,
        );
        const closingCashRegisters = await selectCashRegister(
          token_env,
          organizationId,
          closing_client_ids,
        );

        // TODO: Get all referencing transaction_ids and lineitem_ids to retrieve referencing cash_point_closing_ids

        for (const transaction of transactions) {
          const transaction_id = uuidv4();

          if (transaction?.head?.tx_id) {
            transaction.head.tx_id = transaction.head.tx_id.toLowerCase();
          }
          if (transaction?.security?.tss_tx_id) {
            const txId = transaction.security.tss_tx_id as string;
            transaction.security.tss_tx_id = txId.toLowerCase();
          }

          //TODO: find a better way to type this!
          const security: any = transaction.security;
          const references: any = transaction.head.references;

          const timestamp_start = new Date();
          timestamp_start.setTime(transaction.head.timestamp_start * 1000);

          const timestamp_end = new Date();
          timestamp_end.setTime(transaction.head.timestamp_end * 1000);

          let closing_client_revision = 0;
          if (transaction.head.closing_client_id === cashRegister?.client_id) {
            closing_client_revision = cashRegister.revision;
          } else {
            const closingCashRegister = closingCashRegisters.filter(
              (x) => x.client_id == transaction.head.closing_client_id,
            );
            if (closingCashRegister.length) {
              closing_client_revision = closingCashRegister[0].revision;
            } else {
              throw CashRegisterNotFound();
            }
          }

          transactionInputs.push({
            cash_point_closing_id: closing_id,
            transaction_id,
            closing_client_id: transaction.head.closing_client_id,
            closing_client_revision,
            type: transaction.head.type,
            storno: transaction.head.storno,
            transaction_export_id: transaction.head.transaction_export_id,
            bon_number: transaction.head.number,
            timestamp_start,
            timestamp_end,
            name: transaction.head.name,
            user_id: transaction.head.user
              ? transaction.head.user.user_export_id
              : undefined,
            user_name:
              transaction.head.user && transaction.head.user.name
                ? transaction.head.user.name
                : undefined,
            buyer: transaction.head.buyer,
            allocation_groups: transaction.head.allocation_groups,
            full_amount_incl_vat: transaction.data.full_amount_incl_vat,
            notes: transaction.data.notes,
            tse_tx_id: security?.tss_tx_id,
            tx_id: transaction.head.tx_id,
            error_message: security?.error_message,
            tx_number: security?.tx_number,
            tx_start: security?.tx_start,
            tx_end: security?.tx_end,
            process_type: security?.process_type,
            process_data: security?.process_data,
            signature_counter: security?.signature_counter,
            signature: security?.signature,
            externalReferences: references
              ? prepareExternalReferences(
                  references.filter(
                    (r) =>
                      r.type !== 'Transaktion' &&
                      r.type !== 'InterneTransaktion',
                  ) as (ReferenceType1 | ReferenceType2)[],
                  'transaction',
                  closing_id,
                  transaction_id,
                  null,
                )
              : null,
            transactionReferences: references
              ? prepareTransactionReferences(
                  references.filter(
                    (r) => r.type === 'Transaktion',
                  ) as ReferenceType3[],
                  'transaction',
                  transaction_id,
                  null,
                )
              : null,
            internalTransactionReferences: references
              ? prepareInternalTransactionReferences(
                  references.filter(
                    (r) => r.type === 'InterneTransaktion',
                  ) as ReferenceType4[],
                  transaction_id,
                )
              : null,
          });

          if (transaction.data.payment_types) {
            for (const paymentType of transaction.data.payment_types) {
              // TODO: add check if currency_code is not equal to base_currency_code of cash register foreign amount is mandatory
              transactionPaymentTypesInput.push({
                payment_type_id: uuidv4(),
                transaction_id,
                cash_point_closing_id: closing_id,
                entry_type: 'transaction',
                type: paymentType.type,
                currency_code: paymentType.currency_code,
                amount: paymentType.amount,
                name: paymentType.name,
                foreign_amount: paymentType.foreign_amount,
              });
            }
          }

          if (transaction.data.amounts_per_vat_id) {
            for (const amount of transaction.data.amounts_per_vat_id) {
              const vatDefinition =
                vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                  amount.vat_definition_export_id,
                  usedDate,
                );
              if (!vatDefinition) {
                throw VatDefinitionNotFound();
              }

              transactionAmounts.push({
                amounts_per_vat_id: uuidv4(),
                business_case_id: null,
                lineitem_id: null,
                transaction_id,
                entry_type: 'transaction',
                vat_definition_id:
                  vatDefinition.vat_definition_export_id >= 1000
                    ? vatDefinition.vat_definition_id
                    : null,
                system_vat_definition_id:
                  vatDefinition.vat_definition_export_id < 1000
                    ? vatDefinition.vat_definition_id
                    : null,
                vat_definition_export_id: amount.vat_definition_export_id,
                vat: amount.vat,
                excl_vat: amount.excl_vat,
                incl_vat: amount.incl_vat,
                cash_point_closing_id: closing_id,
              });
            }
          }

          if (Array.isArray(transaction.data.lines)) {
            for (const lineitem of transaction.data.lines) {
              const lineitem_id = uuidv4();
              const lineitemReferences = lineitem.references;

              const lineitemInput: LineitemInput = {
                organizationId,
                env: token_env,
                lineitem_id,
                lineitem_export_id: lineitem.lineitem_export_id,
                transaction_id: transaction_id,
                cash_point_closing_id: closing_id,
                business_case_type: lineitem.business_case.type,
                business_case_name: lineitem.business_case.name,
                purchaser_agency_id: lineitem.business_case.purchaser_agency_id,
                storno: lineitem.storno,
                text: lineitem.text,
                in_house: lineitem.in_house,
                voucher_id: lineitem.voucher_id,
                externalReferences: lineitemReferences
                  ? prepareExternalReferences(
                      lineitemReferences.filter(
                        (r) =>
                          r.type !== 'Transaktion' &&
                          r.type !== 'InterneTransaktion',
                      ) as (ReferenceType1 | ReferenceType2)[],
                      'lineitem',
                      closing_id,
                      transaction_id,
                      lineitem_id,
                    )
                  : null,
                transactionReferences: lineitemReferences
                  ? prepareTransactionReferences(
                      lineitemReferences.filter(
                        (r) => r.type === 'Transaktion',
                      ) as ReferenceType3[],
                      'lineitem',
                      transaction_id,
                      lineitem_id,
                    )
                  : null,
                internalLineitemReferences: lineitemReferences
                  ? prepareInternalLineitemReferences(
                      lineitemReferences.filter(
                        (r) => r.type === 'InterneTransaktion',
                      ) as ReferenceType4[],
                      lineitem_id,
                    )
                  : null,
              };

              for (const lineItemAmount of lineitem.business_case
                .amounts_per_vat_id) {
                const vatDefinition =
                  vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                    lineItemAmount.vat_definition_export_id,
                    usedDate,
                  );
                if (!vatDefinition) {
                  throw VatDefinitionNotFound();
                }

                transactionAmounts.push({
                  amounts_per_vat_id: uuidv4(),
                  transaction_id,
                  business_case_id: null,
                  lineitem_id,
                  entry_type: 'lineitem_business_case',
                  vat_definition_id:
                    vatDefinition.vat_definition_export_id >= 1000
                      ? vatDefinition.vat_definition_id
                      : null,
                  system_vat_definition_id:
                    vatDefinition.vat_definition_export_id < 1000
                      ? vatDefinition.vat_definition_id
                      : null,
                  vat_definition_export_id:
                    lineItemAmount.vat_definition_export_id,
                  vat: lineItemAmount.vat,
                  incl_vat: lineItemAmount.incl_vat,
                  excl_vat: lineItemAmount.excl_vat,
                  cash_point_closing_id: closing_id,
                });
              }

              if (lineitem.item) {
                lineitemInput.item_number = lineitem.item.number;
                lineitemInput.quantity = lineitem.item.quantity;
                lineitemInput.price_per_unit = lineitem.item.price_per_unit;
                lineitemInput.gtin = lineitem.item.gtin;
                lineitemInput.quantity_factor = lineitem.item.quantity_factor;
                lineitemInput.quantity_measure = lineitem.item.quantity_measure;
                lineitemInput.group_id = lineitem.item.group_id;
                lineitemInput.group_name = lineitem.item.group_name;

                if (lineitem.item.base_amounts_per_vat_id) {
                  for (const amount of lineitem.item.base_amounts_per_vat_id) {
                    const vatDefinition =
                      vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                        amount.vat_definition_export_id,
                        usedDate,
                      );
                    if (!vatDefinition) {
                      throw VatDefinitionNotFound();
                    }

                    transactionAmounts.push({
                      amounts_per_vat_id: uuidv4(),
                      lineitem_id: lineitem_id,
                      transaction_id: null,
                      business_case_id: null,
                      entry_type: 'lineitem_base_amounts',
                      vat_definition_id:
                        vatDefinition.vat_definition_export_id >= 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      system_vat_definition_id:
                        vatDefinition.vat_definition_export_id < 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      vat_definition_export_id: amount.vat_definition_export_id,
                      excl_vat: amount.excl_vat,
                      vat: amount.vat,
                      incl_vat: amount.incl_vat,
                      cash_point_closing_id: closing_id,
                    });
                  }
                }

                if (lineitem.item.discounts_per_vat_id) {
                  for (const amount of lineitem.item.discounts_per_vat_id) {
                    const vatDefinition =
                      vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                        amount.vat_definition_export_id,
                        usedDate,
                      );
                    if (!vatDefinition) {
                      throw VatDefinitionNotFound();
                    }

                    transactionAmounts.push({
                      amounts_per_vat_id: uuidv4(),
                      lineitem_id: lineitem_id,
                      transaction_id: null,
                      business_case_id: null,
                      entry_type: 'lineitem_discounts',
                      vat_definition_id:
                        vatDefinition.vat_definition_export_id >= 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      system_vat_definition_id:
                        vatDefinition.vat_definition_export_id < 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      vat_definition_export_id: amount.vat_definition_export_id,
                      excl_vat: amount.excl_vat,
                      vat: amount.vat,
                      incl_vat: amount.incl_vat,
                      cash_point_closing_id: closing_id,
                    });
                  }
                }

                if (lineitem.item.extra_amounts_per_vat_id) {
                  for (const amount of lineitem.item.extra_amounts_per_vat_id) {
                    const vatDefinition =
                      vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                        amount.vat_definition_export_id,
                        usedDate,
                      );
                    if (!vatDefinition) {
                      throw VatDefinitionNotFound();
                    }

                    transactionAmounts.push({
                      amounts_per_vat_id: uuidv4(),
                      lineitem_id: lineitem_id,
                      transaction_id: null,
                      business_case_id: null,
                      entry_type: 'lineitem_extra_amounts',
                      vat_definition_id:
                        vatDefinition.vat_definition_export_id >= 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      system_vat_definition_id:
                        vatDefinition.vat_definition_export_id < 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      vat_definition_export_id: amount.vat_definition_export_id,
                      excl_vat: amount.excl_vat,
                      vat: amount.vat,
                      incl_vat: amount.incl_vat,
                      cash_point_closing_id: closing_id,
                    });
                  }
                }

                if (lineitem.item.sub_items) {
                  lineitemInput.subItems = [];
                  for (const subitem of lineitem.item.sub_items) {
                    const vatDefinition =
                      vatDefinitionPicker.getVatDefinitionByExportIdHoldingHistoric(
                        subitem.amount_per_vat_id.vat_definition_export_id,
                        usedDate,
                      );
                    if (!vatDefinition) {
                      throw VatDefinitionNotFound();
                    }

                    const subitemInput: SubitemEntity = {
                      subitem_id: uuidv4(),
                      lineitem_id,
                      number: subitem.number,
                      quantity: subitem.quantity,
                      vat_definition_id:
                        vatDefinition.vat_definition_export_id >= 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      system_vat_definition_id:
                        vatDefinition.vat_definition_export_id < 1000
                          ? vatDefinition.vat_definition_id
                          : null,
                      vat_definition_export_id:
                        subitem.amount_per_vat_id.vat_definition_export_id,
                      amount_excl_vat: subitem.amount_per_vat_id.excl_vat,
                      amount_incl_vat: subitem.amount_per_vat_id.incl_vat,
                      vat_amount: subitem.amount_per_vat_id.vat,
                      gtin: subitem.gtin,
                      name: subitem.name,
                      quantity_factor: subitem.quantity_factor,
                      quantity_measure: subitem.quantity_measure,
                      group_id: subitem.group_id,
                      group_name: subitem.group_name,
                      cash_point_closing_id: closing_id,
                    };
                    lineitemInput.subItems.push(subitemInput);
                  }
                }
              }

              lineitemsInput.push(lineitemInput);
            }
          }
        }

        // TODO Perf: make async and potentially put into promise pool.
        await insertTransactions(transactionInputs, trx);

        if (lineitemsInput.length) {
          await insertLineitems(lineitemsInput, trx);
        }

        if (transactionPaymentTypesInput.length) {
          await insertPaymentTypes(transactionPaymentTypesInput, trx);
        }

        if (transactionAmounts.length) {
          await insertAmountsPerVatId(transactionAmounts, trx);
        }
      }
    });
  } catch (err) {
    console.trace(err); // TODO: should add request_id
    if (err.statusCode) {
      throw err;
    }

    throw new Error('Error insertClosingHelper: ' + JSON.stringify(err));
  }
};
