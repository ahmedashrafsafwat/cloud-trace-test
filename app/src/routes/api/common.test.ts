import test from 'ava';
import fastify from '../../server';
import { jwt } from 'keyfetch';
import spec from './spec';
import {
  AuthenticationRequest,
  RefreshTokenAuthentication,
  ApiKeyAuthentication,
} from './models';
import { setupTest } from '../../helpers/testHelper';

const { basePath } = spec;

test('common', (t) => {
  t.pass();
});

export const credentials = {
  testApiKey: {
    api_key: 'test_d9t8f32bhrq0g64bajkx781dd_used-in-tests--do-not-delete',
    api_secret: 'Xfi7KrBO6rWjjhut25f5SaDbmAH7CT6UqzCHEElmReY',
  },
  testApiKeyAlternative: {
    api_key: 'test_48jgrw5j4mzqe0eqrqms7ngin_used-in-tests--do-not-delete',
    api_secret: 'G0hDhG8RxcUlrZDj6ZC30DSIts6kscXUbYVk1yUtjlb',
  },
  clientId: 'b82895c3-1cbe-4db1-a22a-2f40db80e9a4',
  tssId: 'ed63d269-678f-4bbe-8df4-f1b541e34bc3',
};

export async function testAuthenticate(
  request: AuthenticationRequest,
  t?: any,
) {
  const { api_key, api_secret, refresh_token } =
    request as ApiKeyAuthentication & RefreshTokenAuthentication;
  const response = await fastify.inject({
    method: 'POST',
    url: `${basePath}/auth`,
    payload: {
      api_key,
      api_secret,
      refresh_token,
    },
  });

  const body = JSON.parse(response.payload);
  const refreshToken = body.refresh_token;
  const accessToken = body.access_token;
  const accessTokenClaims = body.access_token_claims;
  const tokenEnv = accessTokenClaims.env;
  const { claims } = jwt.decode(accessToken);
  const userId = claims.sub;

  if (t) {
    t.is(response.statusCode, 200, 'status is successful');
    t.true('refresh_token' in body, 'body has a refresh_token');
    t.true('access_token' in body, 'body has an access_token');
    t.true('access_token_claims' in body, 'body has access_token_claims');
    t.true(['LIVE', 'TEST'].includes(tokenEnv), 'has valid env');

    t.is(typeof userId, 'string');
    t.is(accessTokenClaims.env, claims.env);
    t.is(accessTokenClaims.organization_id, claims.organization);
  }

  return {
    response,
    accessToken,
    refreshToken,
    userId,
    tokenEnv,
    claims,

    token: accessToken,
    env: tokenEnv,
    organization_id: claims.organization,
  };
}

export async function initBeforeEachExportTests(t) {
  t.beforeEach(async function () {
    const { accessToken, tokenEnv, claims } = await testAuthenticate(
      credentials.testApiKey,
    );

    t.context.token = accessToken;
    t.context.env = tokenEnv;
    t.context.organization_id = claims.organization;
    return { accessToken, tokenEnv, organization_id: claims.organization_id };
  });
}

export async function initExportTests(t, closing_id, export_id) {
  t.test('Setup', async function () {
    await setupTest({
      token: t.context.token,
      env: t.context.env,
      organization_id: t.context.organization_id,
      cashRegisterInput: {},
      closingInput: { closing_id },
      exportInput: {
        export_id,
      },
    });
  });
}
