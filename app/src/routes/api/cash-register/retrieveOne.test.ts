import test from 'ava';
import fastify from '../../../server';
import { testAuthenticate, credentials } from '../common.test';
import spec from '../spec';
import { v4 as uuidv4 } from 'uuid';
import constants from '../../../constants';
import { setupTest } from '../../../helpers/testHelper';
import { Env } from '../models';
import sql from '../../../db';

const { basePath } = spec;

let token: string | null = null;
let env: Env | null = null;
let organization_id: string | null = null;
let client_id = null;
let tss_id = null;

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
  tss_id = result.tssId;
  t.pass();
});

test('Retrieve CashRegister', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.is(body.client_id, client_id);
  t.true('foo' in body.metadata);
});

test('Retrieve CashRegister Not Found', async (t) => {
  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${uuidv4()}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_CASH_REGISTER_NOT_FOUND);
});

test('Retrieve CashRegister SignApiVersion 2', async (t) => {
  client_id = uuidv4();
  await sql`
    INSERT INTO cash_registers (
      client_id,
      revision,
      tss_id,
      base_currency_code,
      brand,
      model,
      sw_version,
      sw_brand,
      vat_not_determineable,
      master_client_id,
      metadata,
      organization_id,
      env,
      version,
      time_creation,
      time_update,
      sign_api_version
      )
    VALUES (
      ${client_id},
      '0',
      ${tss_id},
      'EUR',
      'test001',
      'foo',
      'unicorn',
      'fiskaly',
      false,
      null,
      null,
      ${organization_id},
      'TEST',
      9000,
      '2021-08-17T12:19:57.832Z',
      '2021-08-17T12:19:57.832Z',
      2)
    RETURNING *
  `;

  const res = await fastify.inject({
    method: 'GET',
    url: `${basePath}/cash_registers/${client_id}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = JSON.parse(res.payload);
  t.is(res.statusCode, 200);
  t.is(body.sign_api_version, 2);
});

test.after(async () => await fastify.close());
