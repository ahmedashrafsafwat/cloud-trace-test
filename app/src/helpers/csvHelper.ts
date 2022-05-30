import { createObjectCsvWriter } from 'csv-writer';
import { DsfinvkCsvRecord } from '../models/dsfinvk';

export async function writeDsfinvkCsvFile(
  records: DsfinvkCsvRecord[],
  destinationFilePath: string,
): Promise<void> {
  if (!records || records.length == 0) {
    return;
  }

  const csvWriter = createObjectCsvWriter({
    path: destinationFilePath,
    header: Object.keys(records[0]).map((k) => ({
      id: k,
      title: k.toUpperCase(),
    })),
    fieldDelimiter: ';',
    recordDelimiter: '\r\n',
    alwaysQuote: true,
  });

  await csvWriter.writeRecords(records);
}
