import test from 'ava';
import fastify from '../../../server';
import { testAuthenticate, credentials } from '../common.test';
import spec from '../spec';
import { v4 as uuidv4 } from 'uuid';
import { initialSetupTest, clearTestSetup } from '../../../helpers/testHelper';
import constants from '../../../constants';
import sql from '../../../db';
import {
  selectCashRegister,
  selectCashRegisterByDate,
} from '../../../db/cash_register';
import { CashRegisterEntity } from '../../../models/db';

const { basePath } = spec;

let token: string | null = null;
let tss_id = null;
let client_id = null;
let client_id2 = null;
let creation_time: number;
const externalTss = {
  serial_number: 'fd00000aa8660b5b010006acdc',
  signature_algorithm: 'SHA-256',
  signature_timestamp_format: 'unixTime',
  transaction_data_encoding: 'UTF-8',
  public_key: 'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7',
  certificate: 'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7',
};
const CashRegisterWithExternalTssPayload = {
  cash_register_type: {
    type: 'MASTER',
    tss_id: '',
    serial_number: '',
    signature_algorithm: '',
    signature_timestamp_format: '',
    transaction_data_encoding: '',
    public_key: '',
    certificate: '',
  },
  base_currency_code: 'EUR',
  brand: 'ACME',
  model: 'Model XYZ',
  software: {
    brand: 'Brand',
    version: '1.0',
  },
  metadata: {
    foo: 'bar',
  },
  processing_flags: {
    UmsatzsteuerNichtErmittelbar: true,
  },
  // The following field should be ignored and the result should be sign_api_version: 1
  sign_api_version: 1,
};

test.beforeEach(async () => {
  const { accessToken } = await testAuthenticate(credentials.testApiKey);
  const result = await initialSetupTest(accessToken);
  tss_id = result.tssId;
  client_id = result.clientId;
  client_id2 = result.clientId2;
  token = accessToken;
  CashRegisterWithExternalTssPayload.cash_register_type = {
    type: 'MASTER',
    tss_id,
    ...externalTss,
  };
});

test('Upsert CashRegister Invalid', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      base_currency_code: 'EUR',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 400);
  t.is(body.code, constants.E_FAILED_SCHEMA_VALIDATION);
});

test('Upsert CashRegister Master Invalid Client ID', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
        tss_id,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_CLIENT_NOT_FOUND);
});

test('Upsert CashRegister Master Missing TSS', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 400);
  t.is(body.code, constants.E_FAILED_SCHEMA_VALIDATION);
});

test('Upsert CashRegister Master Invalid TSS', async (t) => {
  // const useClientId = client_id;
  const useClientId = uuidv4();
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${useClientId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'MASTER',
        tss_id: uuidv4(),
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_TSS_NOT_FOUND);
});

test('Upsert CashRegister Master', async (t) => {
  const software = {
    brand: 'Brand',
    version: '1.0',
  };
  const processingFlags = {
    UmsatzsteuerNichtErmittelbar: true,
  };

  const res = await fastify.inject({
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
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: software,
      metadata: {
        foo: 'bar',
      },
      processing_flags: processingFlags,
      // The following field should be ignored and the result should be sign_api_version: 1
      sign_api_version: 2,
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.client_id, client_id);
  t.is(body.revision, 0);
  t.is(body.cash_register_type, 'MASTER');
  t.true('foo' in body.metadata);
  t.is(typeof body.software, 'object');
  t.deepEqual(body.software, software);
  t.is(typeof body.processing_flags, 'object');
  t.deepEqual(body.processing_flags, processingFlags);
  t.is(body.sign_api_version, 1);
  creation_time = body.time_creation;
});

// This test actually checks the selectCashRegisterByDate which in turn is needed to create a Cash Point Closing with
// a head.business_date set.
test('Upsert CashRegister Master to create a new revision and then selecting the old revision by date', async (t) => {
  const software = {
    brand: 'Brand',
    version: '1.1',
  };

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const res = await fastify.inject({
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
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ0',
      software,
      metadata: {
        foo: 'bar',
      },
      processing_flags: {
        UmsatzsteuerNichtErmittelbar: true,
      },
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.client_id, client_id);
  t.is(body.revision, 1);
  t.is(body.time_creation, creation_time);

  // Select cash register by date
  const cashRegisterFromDbResult = await sql`
        SELECT * FROM cash_registers WHERE client_id = ${client_id} ORDER BY revision DESC LIMIT 1;
      `;
  let cashRegister = cashRegisterFromDbResult[0] as CashRegisterEntity;
  const selectedCashRegisterByDate = await selectCashRegisterByDate(
    cashRegister.env,
    cashRegister.organization_id,
    client_id,
    creation_time,
  );
  t.is(selectedCashRegisterByDate.revision, 0);

  cashRegister = await selectCashRegister(
    cashRegister.env,
    cashRegister.organization_id,
    client_id,
  );
  t.is(cashRegister.revision, 1);
});

test('Upsert CashRegister Slave Invalid Master', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'SLAVE_WITHOUT_TSS',
        master_client_id: uuidv4(),
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
      metadata: {
        foo: 'bar',
      },
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_CASH_REGISTER_NOT_FOUND);
});

test('Upsert CashRegister Slave Invalid TSS', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'SLAVE_WITH_TSS',
        master_client_id: client_id,
        tss_id: uuidv4(),
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
      metadata: {
        foo: 'bar',
      },
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_TSS_NOT_FOUND);
});

test('Upsert CashRegister Slave', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'SLAVE_WITHOUT_TSS',
        master_client_id: client_id,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        version: '1.0',
      },
      metadata: {
        foo: 'bar',
      },
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.master_client_id, client_id);
  t.is(body.cash_register_type, 'SLAVE_WITHOUT_TSS');
  t.true('foo' in body.metadata);
});

test('Upsert CashRegister with or without version and brand', async (t) => {
  let expectedRevision = 2;
  const testCases = [
    {
      software: {
        brand: 'Brand',
        version: '2.0',
      },
      expectedRevision: expectedRevision,
    },
    {
      software: {
        brand: 'Brand',
      },
      expectedRevision: expectedRevision,
    },
    {
      software: {
        version: '2.0',
      },
      expectedRevision: expectedRevision,
    },
    {
      software: {
        brand: 'Brand',
        version: '2.0',
      },
      expectedRevision: expectedRevision,
    },
    {
      software: {
        brand: 'New brand',
      },
      expectedRevision: ++expectedRevision,
    },
    {
      software: {
        version: '2.1',
      },
      expectedRevision: ++expectedRevision,
    },
    {
      software: {
        brand: 'New brand 2',
        version: '2.2',
      },
      expectedRevision: ++expectedRevision,
    },
  ];

  for (const testCase of testCases) {
    const payload = {
      cash_register_type: {
        type: 'MASTER',
        tss_id,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: testCase.software,
    };
    const res = await fastify.inject({
      method: 'PUT',
      url: `${basePath}/cash_registers/${client_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: payload,
    });

    const body = JSON.parse(res.payload);

    t.is(res.statusCode, 200);
    t.is(body.revision, testCase.expectedRevision);
  }
});

test('Upserting clients with same client_id but different sign_api_version should fail with conflict', async (t) => {
  async function createCashRegister(sign_api_version: number) {
    const payload = {
      cash_register_type: {
        type: 'MASTER',
        tss_id,
      },
      base_currency_code: 'EUR',
      brand: 'ACME',
      model: 'Model XYZ',
      software: {
        brand: 'Brand',
        version: '2',
      },
    };
    const res = await fastify.inject({
      method: 'PUT',
      url: `${basePath}/cash_registers/${client_id2}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: payload,
    });

    if (res.statusCode === 200 && sign_api_version === 2) {
      await sql`UPDATE cash_registers SET sign_api_version = 2 WHERE client_id = ${client_id2}`;
    }
    return res;
  }

  await createCashRegister(2);
  const res = await createCashRegister(1);

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 409);
  t.is(body.code, constants.E_CASH_REGISTER_CONFLICT);
});

test('Insert cash register with valid external TSS', async (t) => {
  await clearTestSetup();

  delete CashRegisterWithExternalTssPayload.cash_register_type.tss_id;
  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: CashRegisterWithExternalTssPayload,
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.serial_number, externalTss.serial_number);
  t.is(body.signature_algorithm, externalTss.signature_algorithm);
  t.is(body.signature_timestamp_format, externalTss.signature_timestamp_format);
  t.is(body.transaction_data_encoding, externalTss.transaction_data_encoding);
  t.is(body.public_key, externalTss.public_key);
  t.is(body.certificate, externalTss.certificate);
});

test('Upserting cash register with valid external TSS', async (t) => {
  delete CashRegisterWithExternalTssPayload.cash_register_type.tss_id;

  CashRegisterWithExternalTssPayload.cash_register_type.serial_number =
    'bb7114dcb857f8696603c066d756660f';
  CashRegisterWithExternalTssPayload.cash_register_type.public_key =
    'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7';
  CashRegisterWithExternalTssPayload.cash_register_type.certificate =
    'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7';

  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id2}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: CashRegisterWithExternalTssPayload,
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(
    body.serial_number,
    CashRegisterWithExternalTssPayload.cash_register_type.serial_number,
  );
  t.is(
    body.public_key,
    CashRegisterWithExternalTssPayload.cash_register_type.public_key,
  );
  t.is(
    body.certificate,
    CashRegisterWithExternalTssPayload.cash_register_type.certificate,
  );
});

test('Upserting cash register with invalid external TSS', async (t) => {
  CashRegisterWithExternalTssPayload.cash_register_type.type = 'Not-Master';
  CashRegisterWithExternalTssPayload.cash_register_type.serial_number =
    'bb66d99999f';
  CashRegisterWithExternalTssPayload.cash_register_type.signature_algorithm =
    'SHA-25611';
  CashRegisterWithExternalTssPayload.cash_register_type.signature_timestamp_format =
    'unixTimes';
  CashRegisterWithExternalTssPayload.cash_register_type.transaction_data_encoding =
    'UTF-81';
  CashRegisterWithExternalTssPayload.cash_register_type.public_key =
    'publickey';
  CashRegisterWithExternalTssPayload.cash_register_type.certificate =
    'certificate';

  const res = await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${client_id2}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: CashRegisterWithExternalTssPayload,
  });

  t.is(res.statusCode, 400);
});

test.after(async () => await fastify.close());
