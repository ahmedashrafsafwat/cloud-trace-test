import test from 'ava';
import fastify from '../../../server';
import { testAuthenticate, credentials } from '../common.test';
import spec from '../spec';
import { v4 as uuidv4 } from 'uuid';
import constants from '../../../constants';
import { Env } from '../models';
import { setupTest } from '../../../helpers/testHelper';

const { basePath } = spec;

let token: string | null = null;
let env: Env | null = null;
let organization_id: string | null = null;
let client_id: string | null = null;

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
    cashRegisterInput: {
      payload: { metadata: { foo: 'bar' } },
    },
  });

  client_id = result.clientId;
  t.pass();
});

test('Retrieve CashRegister Metadata', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${client_id}/metadata`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.true('foo' in body);
});

test('Retrieve CashRegister Metadata Not Found', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${uuidv4()}/metadata`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_CASH_REGISTER_NOT_FOUND);
});

test('Retrieve CashRegister Metadata when Metadata was not set', async (t) => {
  const clientId = uuidv4();
  await fastify.inject({
    method: 'PUT',
    url: `${basePath}/cash_registers/${clientId}`,
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
    },
  });

  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${clientId}/metadata`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 200);
  t.is(!!body, true);
});

test.after(async () => await fastify.close());
