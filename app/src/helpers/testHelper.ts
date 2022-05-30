import { v4 as uuidv4 } from 'uuid';
import fastify from '../server';
import got, { Method } from 'got';
import spec from '../routes/api/spec';
import {
  ClientId,
  PurchaserAgencyId,
  Metadata,
  Env,
  OrganizationId,
  TssId,
  MetadataRequest,
  PurchaserAgencyRequest,
  ClosingId,
  CashPointClosingInsert,
  OperationState,
  CashPointClosingResponse,
  Transaction,
  BusinessCase,
  LineItem,
  UnixTimestamp,
  VatDefinitionRequest,
  CashRegisterRequest,
  ExportTriggerRequest,
} from '../routes/api/models';
import { getVatDefinitions } from '../db/vatDefinitions';
import { SystemVatDefinitionEntity, VatDefinitionEntity } from '../models/db';
import constants from '../constants';
import { Stream } from 'stream';
import { extract as tarExtract } from 'tar-stream';
import * as csv from '@fast-csv/parse';
import sql, { getKnex } from '../db';
import VatDefinitionPicker, {
  VatDefinitionSelection,
} from './vatDefinitionPicker';
import convertToFloat from './convertToFloat';
import { ExecutionContext } from 'ava';
import {
  AllocationGroupsCsv,
  BusinesscasesCsv,
  CashPerCurrencyCsv,
  CashpointclosingCsv,
  CashregisterCsv,
  DatapaymentCsv,
  ItemamountsCsv,
  LinesCsv,
  LinesVatCsv,
  LocationCsv,
  PaCsv,
  PaymentCsv,
  ReferencesCsv,
  SlavesCsv,
  SubitemsCsv,
  TransactionsCsv,
  TransactionsTseCsv,
  TransactionsVatCsv,
  TseCsv,
  VatCsv,
} from '../models/dsfinvk';

export const DIFF_IGNORE_FIELDS = [
  'Z_KASSE_ID',
  'Z_ERSTELLUNG',
  'TERMINAL_ID',
  'TSE_TA_START',
  'TSE_TA_ENDE',
  'AGENTUR_ID',
  'TSE_ID',
  'POS_TERMINAL_ID',
  'REF_Z_KASSE_ID',
];

export const TEST_UUID = '10000000-0000-0000-0000-000000000000';
type VatDefinitionType =
  | VatDefinitionSelection
  | SystemVatDefinitionEntity
  | VatDefinitionEntity;

interface GenerateCashPointClosingInput {
  client_id: ClientId;
  vatDefinition: VatDefinitionType | VatDefinitionType[];
  purchaser_agency_id?: PurchaserAgencyId;
  metadata?: Metadata;
  amountOfTransactions?: number;
  currentTimestamp?: number;
  sign_api_version?: number;
  export_creation_date?: UnixTimestamp;
  business_date?: string;
}

interface SetupInput {
  token: string;
  env: Env;
  organization_id: OrganizationId;
  cashRegisterInput: {
    client_id?: ClientId;
    tss_id?: TssId;
    payload?: { metadata?: MetadataRequest };
  };
  purchaserAgencyInput?: {
    purchaser_agency_id: PurchaserAgencyId;
    payload?: Partial<PurchaserAgencyRequest>;
  };
  closingInput?: {
    closing_id: ClosingId;
    payload?: { metadata?: MetadataRequest };
  };
  exportInput?: {
    export_id: string;
    payload?: ExportPayload;
  };
  getNewToken?: () => Promise<string>;
}

interface ExportPayload {
  start_date?: number;
  end_date?: number;
  client_id?: ClientId;
  metadata?: MetadataRequest;
  export_creation_date?: UnixTimestamp;
}

const { basePath } = spec;
let initiatedSetup = false;
let tssId = '';
let clientId = '';
let clientId2 = '';
const itemNet = 500;
const subItemNet = 130;
let cashPointClosing: any = null;

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

const round = (n: number, dec = 5): number => {
  return Math.round(n * 10 ** dec) / 10 ** dec;
};

const generateLineInfo = (
  vatDefinition:
    | VatDefinitionSelection
    | SystemVatDefinitionEntity
    | VatDefinitionEntity,
  itemGross: number,
  subItemGross: number,
): LineItem => {
  const subItemVat = subItemGross - subItemNet;
  return {
    lineitem_export_id: getRandomInt(0, 999999).toString(),
    business_case: {
      type: 'Umsatz',
      name: 'Verkauf',
      amounts_per_vat_id: [
        {
          vat_definition_export_id: vatDefinition.vat_definition_export_id,
          excl_vat: itemNet + subItemNet,
          incl_vat: itemGross + subItemGross,
          vat: itemGross - itemNet + subItemVat,
        },
      ],
    },
    in_house: true,
    storno: false,
    references: [
      {
        type: 'ExterneRechnung',
        external_export_id: `invoice_32324`,
      },
      {
        type: 'ExterneSonstige',
        external_other_export_id: `id_34235`,
        name: `ref_78783`,
      },
      {
        type: 'Transaktion',
        cash_point_closing_export_id: 1,
        cash_register_export_id: `ref_898932`,
        transaction_export_id: 'asdf',
      },
    ],
    text: 'MenüI',
    item: {
      number: '5555',
      gtin: 'Ausprägung',
      quantity: 1,
      quantity_factor: 1,
      quantity_measure: 'Stück',
      group_id: '55',
      group_name: 'SpeisenMenü',
      price_per_unit: itemGross,
      base_amounts_per_vat_id: [
        {
          vat_definition_export_id: vatDefinition.vat_definition_export_id,
          incl_vat: itemGross,
          excl_vat: itemNet,
          vat: itemGross - itemNet,
        },
      ],
      sub_items: [
        {
          number: '5555',
          gtin: 'Ausprägung',
          name: 'Cola',
          quantity: 100,
          quantity_factor: 0.2,
          quantity_measure: 'l',
          group_id: '55',
          group_name: 'Antialkoholisch',
          amount_per_vat_id: {
            vat_definition_export_id: vatDefinition.vat_definition_export_id,
            excl_vat: subItemNet,
            incl_vat: subItemGross,
            vat: Math.round(subItemVat * 100) / 100,
          },
        },
      ],
    },
  } as LineItem;
};

const generateTransaction = (
  client_id: string,
  index: number,
  currentTimestamp: number,
  transactionFullAmount: number,
  lineItem: LineItem,
  errorInTransaction = false,
): Transaction => {
  // Since the mockSignConsumer throws errors depending on the first part of the tx id,
  // we use the TEST_UUID
  const tx_id = TEST_UUID;
  const security: any = !errorInTransaction
    ? { tss_tx_id: tx_id }
    : { error_message: 'ERROR' };

  return {
    head: {
      tx_id,
      allocation_groups: ['Tisch5 CPC 2 T1 Head', 'Tisch6 CPC 2 T1 Head'],
      transaction_export_id: `tx_32112`,
      closing_client_id: client_id,
      type: 'Beleg',
      storno: false,
      number: index + 1,
      timestamp_start: currentTimestamp - 60,
      timestamp_end: currentTimestamp,
      user: {
        user_export_id: `usr_32132`,
        name: 'John Doe',
      },
      buyer: {
        name: 'Jane Doe',
        buyer_export_id: `by_432325`,
        type: 'Kunde',
      },
      references: [
        {
          type: 'ExterneRechnung',
          external_export_id: `invoice_43242`,
        },
        {
          type: 'ExterneSonstige',
          external_other_export_id: `id_12312`,
          name: `ref_120233`,
        },
        {
          type: 'Transaktion',
          cash_point_closing_export_id: 1,
          cash_register_export_id: `ref_61065`,
          transaction_export_id: 'asdf',
        },
      ],
    },
    data: {
      full_amount_incl_vat: transactionFullAmount,
      payment_types: [
        {
          type: 'Bar',
          currency_code: 'EUR',
          amount: transactionFullAmount,
        },
      ],
      amounts_per_vat_id: lineItem.business_case.amounts_per_vat_id,
      notes: 'This is a note!',
      lines: [lineItem],
    },
    security: security,
  };
};

interface PartialCashPointClosingInsert {
  transactions: Transaction[];
  business_cases: BusinessCase[];
  current_timestamp: number;
  full_amount: number;
}

const generatePartialCashPointClosing = (
  {
    purchaser_agency_id,
    client_id,
    vatDefinition,
    amountOfTransactions = 1,
  }: GenerateCashPointClosingInput,
  emptyTransaction = false,
  errorInTransaction = false,
): PartialCashPointClosingInsert => {
  const vatDefinitions = Array.isArray(vatDefinition)
    ? vatDefinition
    : [vatDefinition];
  const data: PartialCashPointClosingInsert = {
    transactions: [],
    business_cases: [],
    current_timestamp: 1622463647,
    full_amount: 0,
  };

  const fixedDecimalPoints = (input: number, decimalPoints = 5) => {
    const p = 10 ** decimalPoints;
    return Math.round(input * p) / p;
  };

  for (let i = 0; i < amountOfTransactions; i++) {
    const useVatDefinition = vatDefinitions[i % vatDefinitions.length];
    const itemGross = fixedDecimalPoints(
      itemNet * ((100 + convertToFloat(useVatDefinition.percentage)) / 100),
    );
    const subItemGross = fixedDecimalPoints(
      subItemNet * ((100 + convertToFloat(useVatDefinition.percentage)) / 100),
    );
    const transactionFullAmount = itemGross + subItemGross;

    const lineItem = generateLineInfo(
      useVatDefinition,
      itemGross,
      subItemGross,
    );
    if (!emptyTransaction) {
      data.full_amount += transactionFullAmount;
      const transaction = generateTransaction(
        client_id,
        i,
        data.current_timestamp,
        transactionFullAmount,
        lineItem,
        errorInTransaction,
      );
      data.transactions.push(transaction);
    }
    const businessCase: BusinessCase = {
      type: 'Umsatz',
      amounts_per_vat_id: lineItem.business_case.amounts_per_vat_id,
      purchaser_agency_id,
    };
    data.business_cases.push(businessCase);
  }

  console.log(`${data.transactions.length} Transactions to insert`);
  console.log(`${data.business_cases.length} Business Cases to insert`);

  data.full_amount = round(data.full_amount);

  return data;
};

const generateCashPointClosing = (
  {
    purchaser_agency_id,
    client_id,
    vatDefinition,
    metadata,
    amountOfTransactions = 1,
    sign_api_version = 1,
    export_creation_date,
    business_date,
  }: GenerateCashPointClosingInput,
  emptyTransaction = false,
  errorInTransaction = false,
): CashPointClosingInsert => {
  const partialCashPointClosingInsert: PartialCashPointClosingInsert =
    generatePartialCashPointClosing(
      {
        purchaser_agency_id,
        client_id,
        vatDefinition,
        metadata,
        amountOfTransactions,
      },
      emptyTransaction,
      errorInTransaction,
    );

  return {
    client_id,
    cash_point_closing_export_id: 240368,
    head: {
      export_creation_date:
        export_creation_date || partialCashPointClosingInsert.current_timestamp,
      business_date: business_date,
      first_transaction_export_id: '124',
      last_transaction_export_id: '241297',
    },
    cash_statement: {
      payment: {
        full_amount: partialCashPointClosingInsert.full_amount,
        cash_amount: partialCashPointClosingInsert.full_amount,
        cash_amounts_by_currency: [
          {
            currency_code: 'EUR',
            amount: partialCashPointClosingInsert.full_amount,
          },
        ],
        payment_types: [
          {
            type: 'Bar',
            amount: partialCashPointClosingInsert.full_amount,
            currency_code: 'EUR',
            name: 'foo',
          },
        ],
      },
      business_cases: partialCashPointClosingInsert.business_cases,
    },
    transactions: partialCashPointClosingInsert.transactions,
    metadata,
    sign_api_version,
  } as CashPointClosingInsert;
};

const sendKassensichVRequest = async (
  method = 'GET',
  token: string,
  pathname: string,
  body?: any,
) => {
  const url = `${constants.KASSENSICHV_URL}/api/v${constants.KASSENSICHV_APIV}${pathname}`;
  const headers: any = { authorization: `Bearer ${token}` };
  return got(url, {
    method: method as Method,
    headers,
    json: body,
    responseType: 'json',
  });
};

const createTSSTest = async (token: string): Promise<string> => {
  const response = await sendKassensichVRequest(
    'PUT',
    token,
    `/tss/${uuidv4()}`,
    {
      description: 'DSFinV-K test',
      state: 'INITIALIZED',
    },
  );
  return (response.body as any)._id as string;
};

const createClientTest = async (
  token: string,
  tssId: string,
  serial_number?: string,
): Promise<string> => {
  const response = await sendKassensichVRequest(
    'PUT',
    token,
    `/tss/${tssId}/client/${uuidv4()}`,
    {
      serial_number: serial_number || `serial-number-${uuidv4()}`,
    },
  );
  return (response.body as any)._id;
};

// TODO: instead of truncate, maybe delete of created entities
const clearTestSetup = async () => {
  if (!['test', 'development'].includes(process.env.NODE_ENV)) {
    throw new Error('preventing truncation of db');
  }

  const knex = getKnex();
  await knex.raw('truncate cash_registers cascade');
  await knex.raw('truncate exports cascade');
  await knex.raw('truncate export_requests cascade');
  await knex.raw('truncate vat_definitions cascade');
};

const initialSetupTest = async (token: string) => {
  if (!initiatedSetup) {
    tssId = await createTSSTest(token);
    clientId = await createClientTest(token, tssId);
    clientId2 = await createClientTest(token, tssId);
    initiatedSetup = true;
  }

  return {
    tssId,
    clientId,
    clientId2,
  };
};

const setupTest = async ({
  token: initialToken,
  env,
  cashRegisterInput,
  purchaserAgencyInput,
  closingInput,
  exportInput,
  getNewToken: getNewTokenFn,
}: SetupInput) => {
  const startTime: number = Math.floor(new Date().getTime() / 1000);
  const getNewToken =
    getNewTokenFn != null
      ? getNewTokenFn
      : () => {
          throw new Error('Cannot refetch token');
        };
  let token = initialToken;
  let purchaserAgencyExportId: number;

  await initialSetupTest(token);

  const cashRegister = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${
      cashRegisterInput.client_id || clientId
    }`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
        tss_id: cashRegisterInput.tss_id || tssId,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
      ...cashRegisterInput.payload,
    },
  });

  const cashRegisterV2 = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${clientId2}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
        tss_id: cashRegisterInput.tss_id || tssId,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
      ...cashRegisterInput.payload,
    },
  });
  await sql`UPDATE cash_registers SET sign_api_version = 2 WHERE client_id = ${clientId2}`;

  if (cashRegister.statusCode !== 200 || cashRegisterV2.statusCode !== 200) {
    throw new Error('Setup CashRegister Failed!');
  }

  if (purchaserAgencyInput) {
    const purchaserAgency = await fastify.inject({
      method: 'PUT',
      url: `${basePath}/purchaser_agencies/${purchaserAgencyInput.purchaser_agency_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        client_id: purchaserAgencyInput.payload.client_id || clientId,
        purchaser_agency_export_id: 0,
        name: 'John Doe',
        address: {
          street: 'Street 1',
          postal_code: '123456',
          city: 'Vienna',
          country_code: 'AUT',
        },
        tax_number: 'asdfasdfasdf',
        ...purchaserAgencyInput.payload,
      },
    });

    if (purchaserAgency.statusCode !== 200) {
      throw new Error('Setup PurchaserAgency Failed!');
    }
    const body = purchaserAgency.json();
    purchaserAgencyExportId = body.purchaser_agency_export_id;
  }

  if (closingInput) {
    const vatDefinitions = await getVatDefinitions(null, env);
    const vatDefinitionPicker = new VatDefinitionPicker(vatDefinitions);
    const cashPointClosingPayload = generateCashPointClosing({
      client_id: cashRegisterInput.client_id || clientId,
      vatDefinition: vatDefinitionPicker.getLatestVatDefinitionByExportId(1),
      ...closingInput.payload,
    });

    const cashPointClosingRes = await fastify.inject({
      method: 'PUT',
      url: `${basePath}/cash_point_closings/${closingInput.closing_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: cashPointClosingPayload,
    });

    if (cashPointClosingRes.statusCode !== 200) {
      throw new Error('Setup CashPointClosing Failed!');
    }

    async function waitForCashPointClosingToFinish() {
      const cashPointClosingResult = await fastify.inject({
        method: 'GET',
        url: `${basePath}/cash_point_closings/${closingInput.closing_id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (cashPointClosingResult.statusCode !== 200) {
        throw new Error('Setup CashPointClosing Failed!');
      }

      const cashPointClosingBody = cashPointClosingResult.json();
      if (
        cashPointClosingBody.state === 'PENDING' ||
        cashPointClosingBody.state === 'WORKING'
      ) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(waitForCashPointClosingToFinish()), 500);
        });
      }

      return cashPointClosingBody;
    }

    cashPointClosing = await waitForCashPointClosingToFinish();
  }

  if (exportInput) {
    const { export_id, payload } = exportInput;

    let closingState: OperationState = 'PENDING';
    let body: CashPointClosingResponse | null = null;
    let tokenRetries = 3;

    do {
      await new Promise((r) => setTimeout(r, 500));

      const res = await fastify.inject({
        method: 'GET',
        url: `${basePath}/cash_point_closings/${closingInput.closing_id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      body = JSON.parse(res.payload);
      if (
        res.statusCode === 401 &&
        /token's/.test(res.payload) &&
        tokenRetries > 0
      ) {
        tokenRetries--;
        const passedMinutes = (new Date().getTime() / 1000 - startTime) / 60;
        console.warn(`Getting new token after ${passedMinutes} min`);
        console.warn(`Last closingState: ${closingState}`);
        token = await getNewToken();
        continue;
      } else if (res.statusCode === 404) {
        throw new Error('Given closing_id not found');
      }

      closingState = body.state;
    } while (closingState === 'PENDING' || closingState === 'WORKING');

    const exportResponse = await fastify.inject({
      method: 'PUT',
      url: `${basePath}/exports/${export_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        start_date: startTime - 1000,
        end_date: Math.floor(new Date().getTime() / 1000) + 1000,
        ...payload,
      },
    });

    if (exportResponse.statusCode !== 200) {
      throw new Error('Setup Export Failed!');
    }
    const exportResult = await waitForExport(token, export_id);
    if (exportResult.state !== 'COMPLETED') {
      throw new Error(
        `Setup Export Failed! ${JSON.stringify(exportResult.error)}`,
      );
    }
  }

  return {
    tssId,
    clientId,
    clientIdV2: cashRegisterV2.json().client_id,
    cashPointClosing,
    purchaserAgencyExportId,
  };
};

export async function setupTestWithAuth(t, auth, args, pass = true) {
  const result = await setupTest({
    ...args,
    token: auth.token,
    env: auth.env,
    organization_id: auth.organization_id,
  });
  if (pass) {
    t.pass();
  }
  return result;
}

const waitForCashPointClosing = async (token: string, closingId: string) => {
  let body: any = {};
  let closingState: string | null = null;

  do {
    await new Promise((r) => setTimeout(r, 500));

    const res = await fastify.inject({
      method: 'GET',
      url: `${basePath}/cash_point_closings/${closingId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    body = JSON.parse(res.payload);

    closingState = body.state;
  } while (closingState === 'PENDING' || closingState === 'WORKING');

  return body;
};

export async function createExport(
  t: ExecutionContext,
  token: string,
  payload: ExportTriggerRequest,
  exportId: string = null,
  expectedStatusCode = 200,
  expectedState = 'COMPLETED',
) {
  const usedExportId = exportId || uuidv4();
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/exports/${usedExportId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload,
  });

  t.is(res.statusCode, expectedStatusCode);
  const result = await waitForExport(token, usedExportId);
  t.is(result.state, expectedState);
  return result;
}

export async function getExportTar(
  t: ExecutionContext,
  token: string,
  exportId: string,
  expectedStatusCode = 200,
) {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/exports/${exportId}/download`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (t != null) {
    t.is(res.statusCode, expectedStatusCode);
  }
  return res.rawPayload;
}

export const waitForExport = async (token: string, exportId: string) => {
  let body: any = {};
  let closingState: string | null = null;

  do {
    await new Promise((r) => setTimeout(r, 500));

    const res = await fastify.inject({
      method: 'GET',
      url: `${basePath}/exports/${exportId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    body = JSON.parse(res.payload);

    closingState = body.state;
  } while (closingState === 'PENDING' || closingState === 'WORKING');

  return body;
};

export const createVatDefinition = async (
  t,
  token,
  vatDefinitionExportId,
  payload: VatDefinitionRequest = {
    percentage: 20,
    description: 'Yet another custom vat definition',
    metadata: {
      foo: 'bar',
    },
  },
  expectedStatusCode = 200,
) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/vat_definitions/${vatDefinitionExportId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload,
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, expectedStatusCode);
  if (expectedStatusCode === 200) {
    t.is(body.vat_definition_export_id, vatDefinitionExportId);
  }
};

export interface TarResults {
  headers: Record<string, any>;
  contents: Record<string, string>;
}

export interface TarFiles {
  [fileName: string]: string;
}

export async function readTar(tarBuffer: Buffer): Promise<TarFiles> {
  return new Promise((resolve) => {
    const tarStream = new Stream.PassThrough();
    tarStream.end(tarBuffer);
    const extract = tarExtract();
    const files = {};
    extract.on('entry', (header, stream, next) => {
      const { name } = header;
      let fileName = name;
      if (fileName.startsWith('./')) {
        fileName = name.substring(2);
      }
      const chunks = [];
      stream.on('error', (err) => {
        throw err;
      });
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('end', () => {
        files[fileName] = Buffer.concat(chunks).toString('binary');
        next();
      });
    });
    extract.on('finish', () => {
      resolve(files);
    });
    tarStream.pipe(extract);
  });
}

const getTarContentsWithHeaders = (tarBuffer): Promise<TarResults> =>
  new Promise<TarResults>((resolve, reject) => {
    const tarStream = new Stream.PassThrough();

    tarStream.end(tarBuffer);

    const extract = tarExtract();
    const headers = {};
    const contents = {};
    extract.on('entry', (header, stream, next) => {
      const { name } = header;
      const chunks = [];
      headers[name] = header;

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        contents[name] = Buffer.concat(chunks).toString('binary');
        next();
      });
    });

    extract.on('finish', () => {
      resolve({ contents, headers });
    });

    tarStream.pipe(extract);
  });

function dynamicParameterSort(property1, porperty2?) {
  return function (a, b) {
    if (porperty2 && a[property1] === b[property1]) {
      // Price is only important when cities are the same
      return b[porperty2] - a[porperty2];
    }
    return a[property1] < b[property1]
      ? -1
      : a[property1] > b[property1]
      ? 1
      : 0;
  };
}

export const getAllCsvObjects = async (contents) => {
  const allocation_groups = await csvToObject<AllocationGroupsCsv>(
    'allocation_groups.csv',
    contents,
    false,
  );
  const businesscases = await csvToObject<BusinesscasesCsv>(
    'businesscases.csv',
    contents,
    false,
  );
  const cash_per_currency = await csvToObject<CashPerCurrencyCsv>(
    'cash_per_currency.csv',
    contents,
    false,
  );
  const cashpointclosing = await csvToObject<CashpointclosingCsv>(
    'cashpointclosing.csv',
    contents,
    false,
  );
  const cashregister = await csvToObject<CashregisterCsv>(
    'cashregister.csv',
    contents,
    false,
  );
  const datapayment = await csvToObject<DatapaymentCsv>(
    'datapayment.csv',
    contents,
    false,
  );
  const itemamounts = await csvToObject<ItemamountsCsv>(
    'itemamounts.csv',
    contents,
    false,
  );
  const lines = await csvToObject<LinesCsv>('lines.csv', contents, false);
  const lines_vat = await csvToObject<LinesVatCsv>(
    'lines_vat.csv',
    contents,
    false,
  );
  const location = await csvToObject<LocationCsv>(
    'location.csv',
    contents,
    false,
  );
  const pa = await csvToObject<PaCsv>('pa.csv', contents, false);
  const payment = await csvToObject<PaymentCsv>('payment.csv', contents, false);
  const references = await csvToObject<ReferencesCsv>(
    'references.csv',
    contents,
    false,
  );
  const slaves = await csvToObject<SlavesCsv>('slaves.csv', contents, false);
  const subitems = await csvToObject<SubitemsCsv>(
    'subitems.csv',
    contents,
    false,
  );
  const transactions = await csvToObject<TransactionsCsv>(
    'transactions.csv',
    contents,
    false,
  );
  const transactions_tse = await csvToObject<TransactionsTseCsv>(
    'transactions_tse.csv',
    contents,
    false,
  );
  const transactions_vat = await csvToObject<TransactionsVatCsv>(
    'transactions_vat.csv',
    contents,
    false,
  );
  const tse = await csvToObject<TseCsv>('tse.csv', contents, false);
  const vat = await csvToObject<VatCsv>('vat.csv', contents, false);

  allocation_groups.sort(dynamicParameterSort('ABRECHNUNGSKREIS'));
  businesscases.sort(dynamicParameterSort('GV_TYP', 'UST_SCHLUESSEL'));
  cash_per_currency.sort(dynamicParameterSort('Z_NR', 'ZAHLART_BETRAG_WAEH'));
  cashpointclosing.sort(dynamicParameterSort('Z_NR', 'Z_START_ID'));
  cashregister.sort(dynamicParameterSort('Z_NR', 'Z_ERSTELLUNG'));
  datapayment.sort(dynamicParameterSort('BON_ID', 'ZAHLART_TYP'));
  itemamounts.sort(dynamicParameterSort('BON_ID', 'PF_BRUTTO'));
  lines.sort(dynamicParameterSort('WARENGR_ID', 'FAKTOR'));
  lines_vat.sort(dynamicParameterSort('BON_ID', 'POS_ZEILE'));
  location.sort(dynamicParameterSort('Z_NR'));
  // TODO: pa.sort(dynamicParameterSort('Z_NR'));
  payment.sort(dynamicParameterSort('Z_NR', 'ZAHLART_TYP'));
  references.sort(dynamicParameterSort('POS_ZEILE', 'BON_ID'));
  slaves.sort(dynamicParameterSort('Z_NR'));
  // TODO: subitems.sort(dynamicParameterSort('Z_NR'));
  transactions.sort(dynamicParameterSort('BON_ID', 'BON_NR'));
  transactions_tse.sort(dynamicParameterSort('BON_ID', 'Z_NR'));
  transactions_vat.sort(dynamicParameterSort('BON_ID', 'UST_SCHLUESSEL'));
  tse.sort(dynamicParameterSort('Z_NR'));
  vat.sort(dynamicParameterSort('Z_NR', 'UST_SCHLUESSEL'));

  return {
    allocation_groups,
    businesscases,
    cash_per_currency,
    cashpointclosing,
    cashregister,
    datapayment,
    itemamounts,
    lines,
    lines_vat,
    location,
    pa,
    payment,
    references,
    slaves,
    subitems,
    transactions,
    transactions_tse,
    transactions_vat,
    tse,
    vat,
  };
};

async function csvToObject<T>(
  fileName: string,
  contents: { [key: string]: string },
  firstOnly?: true,
): Promise<T>;
async function csvToObject<T>(
  fileName: string,
  contents: { [key: string]: string },
  firstOnly?: false,
): Promise<T[]>;
async function csvToObject(
  fileName,
  contents,
  firstOnly = true,
): Promise<any | any[]> {
  const content = contents[fileName] || contents['./' + fileName];
  if (!content) {
    throw new Error(`${fileName} does not exist in passed contents object`);
  }

  return new Promise((resolve) => {
    const output = [];
    const stream = csv
      .parse({
        delimiter: ';',
        quote: '"',
        headers: true,
        maxRows: firstOnly ? 1 : 0,
      })
      .on('error', (error) => {
        throw error;
      })
      .on('data', (row) => output.push(row))
      .on('end', () => {
        if (firstOnly) {
          return resolve(output[0] as any);
        }
        resolve(output as any[]);
      });
    stream.write(content);
    stream.end();
  });
}

export async function testCreateCashRegister(
  token: string,
  client_id: string,
  tss_id?: string,
  payload?: Partial<CashRegisterRequest>,
  t?: ExecutionContext,
) {
  if (tss_id == null && payload == null) {
    throw new Error('Either tss_id, payload or both need to be passed');
  }
  const response = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
        tss_id,
      },
      brand: 'fiskaly test client',
      model: 'fiskaly test client',
      software: {
        brand: 'fiskaly test client',
      },
      base_currency_code: 'EUR',
      processing_flags: {
        UmsatzsteuerNichtErmittelbar: true,
      },
      ...payload,
    },
  });

  if (t) {
    t.is(response.statusCode, 200);
  }

  return response.json();
}

// TODO: Combine createCashPointClosing and testCreateCashPointClosing
export async function createCashPointClosing(
  t: ExecutionContext,
  token: string,
  payload: any,
  closingId: string = null,
  expectedStatusCode = 200,
  expectedState = 'COMPLETED',
) {
  const useClosingId = closingId || uuidv4();
  const res = await fastify.inject({
    method: 'PUT',
    url: `${spec.basePath}/cash_point_closings/${useClosingId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload,
  });

  t.is(res.statusCode, expectedStatusCode);
  const result = await waitForCashPointClosing(token, useClosingId);
  if (result.state !== expectedState) {
    console.log(result);
  }
  t.is(result.state, expectedState);

  return result;
}

export async function createDownloadExport(path, token, exportId) {
  return fastify.inject({
    method: 'GET',
    url: `${path}/exports/${exportId}/download`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createCashRegister(client_id, token, payload) {
  return fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload,
  });
}

export async function testCreateCashPointClosing(
  client_id,
  env,
  token,
  export_creation_date?: number,
  business_date?: string,
  t?: ExecutionContext,
) {
  const closingId = uuidv4();
  const vatDefinitions = await getVatDefinitions(null, env);
  const vatDefinitionPicker = new VatDefinitionPicker(vatDefinitions);
  const payload = generateCashPointClosing({
    client_id,
    vatDefinition: vatDefinitionPicker.getLatestVatDefinitionByExportId(1),
    export_creation_date,
    business_date,
  });

  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_point_closings/${closingId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload,
  });

  const result = await waitForCashPointClosing(token, closingId);

  if (t != null) {
    t.is(result.state, 'COMPLETED');
  }

  return closingId;
}

export async function initCashPointClosingsAndExportsFromFixtures(
  t: ExecutionContext,
  token,
): Promise<Buffer> {
  const serial_number = '38f8d83b-af38-4270-882a-449a851cf6ab';
  const response = await sendKassensichVRequest(
    'PUT',
    token,
    `/tss/${uuidv4()}`,
    {
      description: 'Test TSS',
      state: 'INITIALIZED',
    },
  );
  tssId = (response.body as any)._id;
  clientId = await createClientTest(token, tssId, serial_number);

  // tss start transaction 1 & 2
  const createTxCount = 4;
  const txId = [];
  const txTimeStart = [];

  function replaceTxIdPlaceholders(val: string) {
    for (let index = 0; index < txId.length; index++) {
      const txIdReplacement = txId[index];
      const r = new RegExp(`{{tx_id${index + 1}}}`, 'g');
      val = val.replace(r, txIdReplacement);
    }
    return val;
  }

  for (let i = 0; i < createTxCount; i++) {
    const transactionStartV1Response = await sendKassensichVRequest(
      'PUT',
      token,
      `/tss/${tssId}/tx/${uuidv4()}`,
      {
        state: 'ACTIVE',
        client_id: clientId,
      },
    );
    const transactionRes = transactionStartV1Response.body as any;
    const { _id, latest_revision, time_start } = transactionRes;
    txId.push(_id);
    txTimeStart.push(time_start);

    await sendKassensichVRequest(
      'PUT',
      token,
      `/tss/${tssId}/tx/${_id}?last_revision=${latest_revision}`,
      {
        state: 'FINISHED',
        client_id: clientId,
        schema: {
          standard_v1: {
            receipt: {
              receipt_type: 'RECEIPT',
              amounts_per_vat_rate: [
                {
                  vat_rate: '19',
                  amount: '14.28',
                },
              ],
              amounts_per_payment_type: [
                {
                  payment_type: 'NON_CASH',
                  amount: '14.28',
                },
              ],
            },
          },
        },
      },
    );
  }

  // insert vat def
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/vat_definitions/56789`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      percentage: 80,
      description: 'test',
    },
  });
  // insert cash register
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${clientId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      base_currency_code: 'EUR',
      brand: 'MASTER',
      model: 'foo',
      cash_register_type: {
        type: 'MASTER',
        tss_id: tssId,
      },
      software: {
        brand: 'fiskaly',
        version: 'unicorn',
      },
    },
  });
  // insert cash register slave
  const cashRegisterSlave = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      base_currency_code: 'EUR',
      brand: 'SLAVE_WITHOUT_TSS Brand',
      model: 'foo-slave',
      cash_register_type: {
        type: 'SLAVE_WITHOUT_TSS',
        master_client_id: clientId,
      },
      software: {
        brand: 'software_name_slave',
        version: 'v1',
      },
      processing_flags: {
        UmsatzsteuerNichtErmittelbar: true,
      },
      sign_api_version: 2,
      metadata: {
        foo1: 'bar1',
        foo2: 'bar2',
      },
    },
  });
  const clientIdSlave = JSON.parse(cashRegisterSlave.body).client_id;
  // insert purchaser agency slave
  const purchaserAgenciesRes = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/purchaser_agencies/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      client_id: clientId,
      name: 'purchaser agency 001',
      purchaser_agency_export_id: 10,
      address: {
        street: 'Street 1 Agency',
        postal_code: '123456',
        city: 'Vienna Agency',
        country_code: 'AUT',
      },
      tax_number: '1234567890',
      vat_id_number: 'DE-555555555',
    },
  });

  const purchaser_agency_id = JSON.parse(
    purchaserAgenciesRes.body,
  ).purchaser_agency_id;

  // insert cash point closing 1
  const closingId1 = uuidv4();
  const closingId2 = uuidv4();
  const payload1 = {};

  const payload2 = {};

  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_point_closings/${closingId1}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: payload1,
  });

  // insert cash point closing 2
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_point_closings/${closingId2}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: payload2,
  });

  await waitForCashPointClosing(token, closingId2);

  // trigger export
  const exportId = uuidv4();
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/exports/${exportId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      start_date: txTimeStart[0],
      end_date: Math.floor(Date.now() / 1000),
    },
  });

  await waitForExport(token, exportId);
  return getExportTar(t, token, exportId);
}

const generateOneCashPointClosing = async (client_id, env) => {
  const vatDefinitions = await getVatDefinitions(null, env);
  const vatDefinitionPicker = new VatDefinitionPicker(vatDefinitions);
  return generateCashPointClosing({
    client_id,
    vatDefinition: vatDefinitionPicker.getLatestVatDefinitionByExportId(1),
  });
};
export {
  generateCashPointClosing,
  initialSetupTest,
  setupTest,
  clearTestSetup,
  waitForCashPointClosing,
  getTarContentsWithHeaders,
  csvToObject,
  generateOneCashPointClosing,
  createTSSTest,
  createClientTest,
};
