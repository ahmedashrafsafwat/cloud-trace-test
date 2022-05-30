import test from 'ava';
import { Env } from '../models';
import { credentials, testAuthenticate } from '../common.test';
import { setupTest } from '../../../helpers/testHelper';
import fastify from '../../../server';
import spec from '../spec';
import { v4 as uuid } from 'uuid';

let token: string | null = null;
let env: Env | null = null;
let organization_id: string | null = null;
let client_id: string | null = null;
let tss_id: string | null = null;
const { basePath } = spec;

test.beforeEach(async () => {
  const { accessToken, tokenEnv, claims } = await testAuthenticate(
    credentials.testApiKey,
  );
  token = accessToken;
  env = tokenEnv;
  organization_id = claims.organization;
});

test('Setup', async (t) => {
  const result = await setupTest({
    token,
    env,
    organization_id,
    cashRegisterInput: {},
  });
  client_id = result.clientId;
  tss_id = result.tssId;
  t.pass();
});

test('List all CashRegisters', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 200);
  t.true('data' in body);
  t.true(body.data.length > 0);
});

test('Upsert CashRegister Master for next test', async (t) => {
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
      brand: 'BRAND',
      model: 'Model ABC',
      software: {
        brand: 'BRAND',
        version: '2.0',
      },
    },
  });
  t.is(res.statusCode, 200);
});

test('List all CashRegisters with limit', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers`,
    query: { limit: '1' },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 200);
  t.true('data' in body);
  t.true(body.data.length === 1);
  // TODO: add another cahregister to have > cashregisters counted when limit = 1
  t.true(body.count >= 1);
});

test('list all cashregisters with order: desc', async (t) => {
  // Wait one second to make sure a MASTER Cash Register is created in previous test
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuid()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'SLAVE_WITHOUT_TSS',
        master_client_id: `${client_id}`,
      },
      base_currency_code: 'EUR',
      brand: 'BRAND',
      model: 'Model',
      software: {
        version: '1.0',
      },
    },
  });

  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers`,
    query: { order: 'desc' },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  const firstCashRegister = body.data[0];
  const secondCashRegister = body.data[1];
  t.true(firstCashRegister.time_creation > secondCashRegister.time_creation);
  t.is(res.statusCode, 200);
  t.true('data' in body);
  t.true(body.data.length > 0);
});

test('List all CashRegisters with order_by: cash_register_type', async (t) => {
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${uuid()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    payload: {
      cash_register_type: {
        type: 'SLAVE_WITHOUT_TSS',
        master_client_id: `${client_id}`,
      },
      base_currency_code: 'EUR',
      brand: 'BRAND',
      model: 'Model',
      software: {
        version: '1.0',
      },
    },
  });
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers`,
    query: { order_by: 'cash_register_type', order: 'desc' },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 200);
  t.is(body.data[0].cash_register_type, 'SLAVE_WITHOUT_TSS');
  t.true('data' in body);
  t.true(body.data.length > 0);
});

test.after(async () => await fastify.close());
