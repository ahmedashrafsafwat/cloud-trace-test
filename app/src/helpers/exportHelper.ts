import { ExportEntity } from '../models/db';
import { v4 as uuid } from 'uuid';
import Storage from '../services/Storage';
import constants from '../constants';
import fs from 'fs';
import tar from 'tar';
import Path from 'path';
import { completeExport } from '../db/exports';
import { ExportResponse } from '../routes/api/models';
import { VERSION, toString } from '../lib/version';
import { writeDsfinvkCsvFile } from './csvHelper';
import { ReferencesCsv } from '../models/dsfinvk';
import { getCashPointClosingsByExportIdMap } from '../db/closing';
import { Organization } from '../services/Management';
import { selectCashRegistersMapByExportId } from '../db/cash_register';
import { selectPurchaserAgenciesMapByExportId } from '../db/purchaserAgencies';
import { getVatDefinitions } from '../db/vatDefinitions';
import { selectBusinessCasesMapByExportId } from '../db/businessCases';
import { selectCashAmountsPerCurrencyByExportId } from '../db/cash_amounts_by_currency';
import { selectPaymentTypesByExportIdMap } from '../db/payment_types';
import { selectAllAmountsPerVatIdsByExportId } from '../db/amountsPerVatIds';
import {
  selectLinesByExportIdMap,
  selectSubItemsByExportId,
} from '../db/lineitem';
import { selectTransactionsByExportMap } from '../db/transaction';
import { TransactionSecurity, TSS } from '../models';
import { selectReferencesByExportId } from './referenceHelper';
import { transformIndexXML } from './xmlHelper';
import { getKnex, sqlRead } from '../db';
import linesCsv from './exportFileAssemblers/linesCsv';
import paymentTypesIterator from './exportFileAssemblers/paymentTypesIterator';
import transactionsIterator from './exportFileAssemblers/transactionsIterator';
import cashPerCurrencyCsv from './exportFileAssemblers/cashPerCurrencyCsv';
import cashPointClosingsIterator from './exportFileAssemblers/cashPointClosingsIterator';
import amountsPerVatIdsIterator from './exportFileAssemblers/amountsPerVatIdsIterator';
import subitemsCsv from './exportFileAssemblers/subitemsCsv';
import paCsv from './exportFileAssemblers/paCsv';
import zSort from './exportFileAssemblers/zSort';
import slavesCsv, { UsedCashRegisters } from './exportFileAssemblers/slavesCsv';
import config from '../config';
import { logTime } from '../lib/metrics';
import {
  getTransactionIds,
  migrateAmountsPerVatIdsViaBusinessCase,
  migrateAmountsPerVatIdsViaTransaction,
  migrateAmountsPerVatIdsViaLineitem,
  migratePaymentTypesViaTransaction,
  migrateExternalReferencesViaTransaction,
} from './cashPointClosingMigrationHelper';
import VatDefinitionPicker from './vatDefinitionPicker';

console.log(
  `Using the following bucket for DSFinV-K: ${constants.DSFINVK_BUCKET}\nRegion: ${constants.DSFINVK_BUCKET_REGION}`,
);

const REDIS_CURRENTLY_MIGRATING_KEY = 'dsfinvk:currently_migrating';

export function getStartAndEndDateObjects(
  startTimestamp: number,
  endTimestamp: number,
) {
  const startDate = new Date();
  startDate.setTime(startTimestamp * 1000);

  const endDate = new Date();
  endDate.setTime(endTimestamp * 1000 + 999);

  return { startDate, endDate };
}

async function uploadFile(pathToFile: string, filename: string): Promise<any> {
  const client = Storage.getClient();
  const bucketExists = await client.bucketExists(constants.DSFINVK_BUCKET);
  if (!bucketExists) {
    await client.makeBucket(
      constants.DSFINVK_BUCKET,
      constants.DSFINVK_BUCKET_REGION,
    );
  }
  const file = pathToFile;
  const fileStream = fs.createReadStream(file);
  const fileStat = fs.statSync(file);
  return client.putObject(
    constants.DSFINVK_BUCKET,
    filename,
    fileStream,
    fileStat.size,
  );
}

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, _index) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

export async function assembleExport(
  exportObj: ExportEntity,
  organization: Organization,
  tssTransactions: TransactionSecurity[],
  clients: TSS[],
): Promise<void> {
  const { export_id } = exportObj;
  // TODO Perf: use Ram-Disk instea of SSD/HDD
  const tempdir = `/tmp/${export_id}-${uuid()}`;
  const tarFileName = `${export_id}.tar`;
  const pathToTar = `/tmp/${tarFileName}-${uuid()}`;

  fs.mkdirSync(tempdir);
  const gdpdu = 'gdpdu-01-09-2004.dtd';
  fs.copyFileSync(
    Path.resolve(__dirname, '..', gdpdu),
    Path.join(tempdir, gdpdu),
  );

  const closingsMap = await getCashPointClosingsByExportIdMap(export_id, true);
  const cashRegistersMap = await selectCashRegistersMapByExportId(
    export_id,
    true,
  );
  const vatDefinitions = await getVatDefinitions(
    organization._id,
    exportObj.env,
    true,
  );
  const vatDefinitionPicker = new VatDefinitionPicker(vatDefinitions);

  // Fire multiple queries. However, because we have a limited amount of allowed db connections, not all of them should
  // be executed at once.
  // TODO: still needs optimization
  const newQueriesTime = logTime('assembleExportNewQueries');
  const [
    linesMap,
    transactionsMap,
    purchaserAgenciesMap,
    cashAmountsByCurrency,
    paymentTypesMap,
    amountsPerVatIds,
    subitemsResult,
    businessCasesMap,
  ] = await Promise.all([
    selectLinesByExportIdMap(export_id, true),
    selectTransactionsByExportMap(export_id, true),
    selectPurchaserAgenciesMapByExportId(export_id, true),
    selectCashAmountsPerCurrencyByExportId(export_id, true),
    selectPaymentTypesByExportIdMap(export_id, true),
    selectAllAmountsPerVatIdsByExportId(export_id, true),
    selectSubItemsByExportId(export_id, true),
    selectBusinessCasesMapByExportId(export_id, true),
  ]);
  await newQueriesTime.end();

  const oldQueriesTime = logTime('assembleExportOldQueries');
  // TODO: Heavy duty
  const references: ReferencesCsv[] = await selectReferencesByExportId(
    export_id,
    sqlRead,
  );
  zSort(references);
  await oldQueriesTime.end();

  if (!references.length) {
    references.push({
      Z_KASSE_ID: '',
      Z_ERSTELLUNG: '',
      Z_NR: null,
      BON_ID: '',
      POS_ZEILE: '',
      REF_TYP: '',
      REF_NAME: '',
      REF_DATUM: '',
      REF_Z_KASSE_ID: '',
      REF_Z_NR: null,
      REF_BON_ID: '',
    });
  }

  const usedCashRegisters: UsedCashRegisters = {};
  const addUsedCashRegister = (
    cashRegisterId: string,
    revision: number,
    closingId: string,
  ) => {
    if (!usedCashRegisters[cashRegisterId]) {
      usedCashRegisters[cashRegisterId] = [];
    }
    usedCashRegisters[cashRegisterId][revision] = closingId;
  };
  const [cashpointclosings, locations, cashregisters, tse] =
    cashPointClosingsIterator(
      closingsMap,
      organization,
      cashRegistersMap,
      clients,
      addUsedCashRegister,
    );
  const [transactions, transaction_tse, allocations] = transactionsIterator(
    closingsMap,
    transactionsMap,
    tssTransactions,
    clients,
    addUsedCashRegister,
    cashRegistersMap,
  );
  const slaves = slavesCsv(
    closingsMap,
    cashRegistersMap,
    clients,
    usedCashRegisters,
  );

  const [payment, datapayment] = paymentTypesIterator(
    closingsMap,
    paymentTypesMap,
    cashRegistersMap,
    transactionsMap,
  );
  const lines = linesCsv(
    closingsMap,
    linesMap,
    transactionsMap,
    purchaserAgenciesMap,
    cashRegistersMap,
  );
  const cashPerCurrency = cashPerCurrencyCsv(
    closingsMap,
    cashAmountsByCurrency,
  );
  const [transactionsVats, linesVats, itemamounts, vats, businessCases] =
    amountsPerVatIdsIterator(
      closingsMap,
      linesMap,
      transactionsMap,
      vatDefinitionPicker,
      businessCasesMap,
      purchaserAgenciesMap,
      amountsPerVatIds,
    );
  const subitems = subitemsCsv(
    closingsMap,
    linesMap,
    transactionsMap,
    vatDefinitionPicker,
    subitemsResult,
  );
  const pa = paCsv(closingsMap, purchaserAgenciesMap);

  await Promise.all([
    writeDsfinvkCsvFile(cashpointclosings, `${tempdir}/cashpointclosing.csv`),
    writeDsfinvkCsvFile(cashregisters, `${tempdir}/cashregister.csv`),
    writeDsfinvkCsvFile(locations, `${tempdir}/location.csv`),
    writeDsfinvkCsvFile(slaves, `${tempdir}/slaves.csv`),
    writeDsfinvkCsvFile(tse, `${tempdir}/tse.csv`),
    writeDsfinvkCsvFile(vats, `${tempdir}/vat.csv`),
    writeDsfinvkCsvFile(businessCases, `${tempdir}/businesscases.csv`),
    writeDsfinvkCsvFile(pa, `${tempdir}/pa.csv`),
    writeDsfinvkCsvFile(payment, `${tempdir}/payment.csv`),
    writeDsfinvkCsvFile(datapayment, `${tempdir}/datapayment.csv`),
    writeDsfinvkCsvFile(cashPerCurrency, `${tempdir}/cash_per_currency.csv`),
    writeDsfinvkCsvFile(transactions, `${tempdir}/transactions.csv`),
    writeDsfinvkCsvFile(allocations, `${tempdir}/allocation_groups.csv`),
    writeDsfinvkCsvFile(transaction_tse, `${tempdir}/transactions_tse.csv`),
    writeDsfinvkCsvFile(transactionsVats, `${tempdir}/transactions_vat.csv`),
    writeDsfinvkCsvFile(lines, `${tempdir}/lines.csv`),
    writeDsfinvkCsvFile(linesVats, `${tempdir}/lines_vat.csv`),
    writeDsfinvkCsvFile(itemamounts, `${tempdir}/itemamounts.csv`),
    writeDsfinvkCsvFile(subitems, `${tempdir}/subitems.csv`),
    writeDsfinvkCsvFile(references, `${tempdir}/references.csv`), // TODO: still needs to be converted
  ]);

  await transformIndexXML(`${tempdir}/index.xml`);

  await tar.c(
    {
      gzip: false,
      file: pathToTar,
      C: tempdir,
    },
    ['.'],
  );

  deleteFolderRecursive(tempdir);

  await uploadFile(pathToTar, tarFileName);

  fs.unlinkSync(pathToTar);

  // TODO: add md5 checksum of file
  // TODO this is an async function - so we could return promises ;-)
  await completeExport(
    exportObj.export_id,
    constants.DSFINVK_BUCKET,
    tarFileName,
  );
}

async function getCurrentlyMigratingCount(redis) {
  return JSON.parse((await redis.get(REDIS_CURRENTLY_MIGRATING_KEY)) || '0');
}

async function setCurrentlyMigrationCount(redis, delta: number) {
  const currentCount = Math.max(0, await getCurrentlyMigratingCount(redis));
  await redis.set(REDIS_CURRENTLY_MIGRATING_KEY, currentCount + delta);
}

export function exportEntityToResponse(entity: ExportEntity): ExportResponse {
  const exportReply: ExportResponse = {
    _id: entity.export_id,
    state: entity.export_state,
    error: {
      code: entity.error_code,
      message: entity.error_message,
    },
    time_request: Math.floor(entity.time_request.getTime() / 1000),
    time_start: entity.time_start
      ? Math.floor(entity.time_start.getTime() / 1000)
      : null,
    time_completed: entity.time_end
      ? Math.floor(entity.time_end.getTime() / 1000)
      : null,
    time_expiration: entity.time_expiration
      ? Math.floor(entity.time_expiration.getTime() / 1000)
      : null,
    time_error: entity.time_error
      ? Math.floor(entity.time_error.getTime() / 1000)
      : null,
    cash_point_closings: entity.cash_point_closings,
    metadata: entity.metadata,
    _env: entity.env,
    _type: 'EXPORT',
    _version: toString(entity.version),
    sign_api_version: entity.sign_api_version,
  };
  if (exportReply.state !== 'ERROR') {
    delete exportReply.error;
  }
  return exportReply;
}

export async function migrateCashPointClosingsOnFly(exportId, redis: any) {
  // checks which Cash Point Closings are in the Export and if one of them is older
  const closingsMap = await getCashPointClosingsByExportIdMap(exportId, true);
  const closingsArr = Object.values(closingsMap);

  const closings = getCashPointClosingsLessThanThreshold(closingsArr);

  if (!closings.length) {
    return true;
  }

  const currentlyMigrating = await getCurrentlyMigratingCount(redis);

  // return false if the migration queue is full
  // in order to go to noack and try again 10 seconds later
  if (currentlyMigrating >= config.MAX_CPC_MIGRATIONS) {
    return false;
  }
  await setCurrentlyMigrationCount(redis, 1);

  // start migrating one by one
  for (const closing of closings) {
    const cash_point_closing_id = closing.cash_point_closing_id;
    console.log(`Migrating cash point closing ${cash_point_closing_id}...`);

    const knex = getKnex();

    try {
      // migrate sequentially
      const transactionIds = await getTransactionIds(cash_point_closing_id);

      console.log(
        `  Migrating amounts_per_vat_ids via business_case for ${cash_point_closing_id}...`,
      );
      await migrateAmountsPerVatIdsViaBusinessCase(cash_point_closing_id);

      console.log(
        `  Migrating amounts_per_vat_ids via transaction for ${cash_point_closing_id}...`,
      );
      await migrateAmountsPerVatIdsViaTransaction(
        cash_point_closing_id,
        transactionIds,
      );

      console.log(
        `  Migrating amounts_per_vat_ids via lineitem for ${cash_point_closing_id}...`,
      );
      await migrateAmountsPerVatIdsViaLineitem(cash_point_closing_id);

      console.log(
        `  Migrating payment_types via transaction for ${cash_point_closing_id}...`,
      );
      await migratePaymentTypesViaTransaction(
        cash_point_closing_id,
        transactionIds,
      );

      console.log(
        `  Migrating external_references via transaction for ${cash_point_closing_id}...`,
      );
      await migrateExternalReferencesViaTransaction(
        cash_point_closing_id,
        transactionIds,
      );

      // update cash point closing
      await knex('cash_point_closings')
        .update({ version: VERSION })
        .where('cash_point_closing_id', cash_point_closing_id);
    } catch (e) {
      console.error(e);

      // Subtruct from the migration queue as the migration didn't compelete
      await setCurrentlyMigrationCount(redis, -1);
      throw e;
    }
  }

  // Subtruct from the migration queue the migrated tables
  await setCurrentlyMigrationCount(redis, -1);
  return true;
}

function getCashPointClosingsLessThanThreshold(closings) {
  if (
    closings.length &&
    config.MIGRATE_CPC_THRESHOLD &&
    config.MIGRATE_CPC_VERSION_THRESHOLD
  ) {
    const ignoreCPCThreshold = config.MIGRATE_CPC_THRESHOLD * 1000;
    return closings.filter((cashPointClosing) => {
      return (
        cashPointClosing.time_creation.getTime() <= ignoreCPCThreshold &&
        cashPointClosing.version < config.MIGRATE_CPC_VERSION_THRESHOLD
      );
    });
  }

  return [];
}
