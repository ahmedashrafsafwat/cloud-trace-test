import test from 'ava';
import fastify from '../../server';
import { testAuthenticate, credentials } from './common.test';
import spec, { legacyBasePath } from './spec';

const { basePath } = spec;

test('Get error on invalid credentials', async (t) => {
  const res = await fastify.inject({
    method: 'POST',
    url: `${basePath}/auth`,
    payload: {
      api_key: 'invalid_key',
      api_secret: 'invalid_secret',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(body.status_code, 401);
});

test('Get error on invalid refresh token', async (t) => {
  const res = await fastify.inject({
    method: 'POST',
    url: `${basePath}/auth`,
    payload: {
      refresh_token: 'invalid_refresh_token',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(body.status_code, 401);
});

test('Get correct error on invalid credentials against the legacy API', async (t) => {
  const res = await fastify.inject({
    method: 'POST',
    url: `${legacyBasePath}/auth`,
    payload: {
      api_key: 'invalid_key',
      api_secret: 'invalid_secret',
    },
  });

  const body = JSON.parse(res.payload);

  t.is(body.status_code, 401);
});

test('Get access token using an api key', async (t) => {
  await testAuthenticate(credentials.testApiKey, t);
});

test.after(async () => await fastify.close());
