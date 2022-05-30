import test from 'ava';
import fastify from '../../../server';
import { testAuthenticate, credentials } from '../common.test';
import spec from '../spec';
import { v4 as uuid } from 'uuid';
import constants from '../../../constants';
import { setupTestWithAuth } from '../../../helpers/testHelper';

let auth;
let client_id = null;

test.beforeEach(async () => {
  auth = await testAuthenticate(credentials.testApiKey);
});
test('Setup', async (t) => {
  const result = await setupTestWithAuth(t, auth, { cashRegisterInput: {} });
  client_id = result.clientId;
});

test('Upsert CashRegister Metadata Not Found', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${spec.basePath}/cash_registers/${uuid()}/metadata`,
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
    payload: {
      foo: 'bar',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 404);
  t.is(body.code, constants.E_CASH_REGISTER_NOT_FOUND);
});

test('Upsert CashRegister Metadata', async (t) => {
  const res = await fastify.inject({
    method: 'PUT',
    url: `${spec.basePath}/cash_registers/${client_id}/metadata`,
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
    payload: {
      foo: 'bar',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(res.statusCode, 200);
  t.true('foo' in body);
});

test.after(async () => await fastify.close());
