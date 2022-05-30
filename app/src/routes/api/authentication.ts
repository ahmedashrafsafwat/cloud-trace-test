import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { jwt } from 'keyfetch';
import createError from 'http-errors';
import got, { HTTPError } from 'got';
import {
  majorVersion,
  AuthenticationRequestType,
  AuthenticationResponseType,
} from './spec';
import stripIndent from 'strip-indent';
import { AuthenticationRequest, AuthenticationResponse } from './models';
import { createHttpErrorType } from './common';
import hash from '../../lib/hash';

export default async function (fastify: FastifyInstance): Promise<void> {
  const {
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_REALM,
    KEYCLOAK_BASE,
  } = fastify.config;
  const { redis } = fastify;

  const UNAUTHORIZED = {
    status_code: 401,
    error: 'Unauthorized',
    message: 'Invalid credentials',
  };

  function decodeToken(token: string): any {
    const { claims } = jwt.decode(token);
    return claims;
  }

  fastify.route({
    url: '/auth',
    method: 'POST',
    schema: {
      operationId: 'authenticate',
      summary: 'Retrieve token',
      description: stripIndent(`
        Access to our API is only granted with a valid JWT / authorization token that must be obtained using this endpoint.

        Note: If you do not have an \`api_key\` yet, you have to [create one](#section/Authentication/JWT) yourself.
      `),
      tags: ['Authentication'],
      body: AuthenticationRequestType,
      response: {
        200: AuthenticationResponseType,
        401: createHttpErrorType(401, 'Unauthorized.'),
      },
    },
    handler: async (
      request: FastifyRequest,
      reply: FastifyReply<any>,
    ): Promise<AuthenticationResponse> => {
      function getApiKeySecretKey(apiKey, apiSecret) {
        return `dsfinvkV0:auth:token:response_${hash('' + apiKey + apiSecret)}`;
      }

      function getSubMapKey(refreshToken) {
        try {
          const user = jwt.decode(refreshToken);
          const { sub } = user.claims || {};
          return `dsfinvkV0:sub:map:${sub}`;
        } catch (e) {
          request.log.warn(e);
        }
      }

      async function resetCacheOnInvalidRefreshToken(req) {
        // Requests without a refresh_token can be ignored here as we won't need to reset anything
        if (!req.body.refresh_token) {
          return;
        }

        const subMapKey = getSubMapKey(req.body.refresh_token);
        const key = await redis.get(subMapKey);
        if (key) {
          await redis.del(key);
        }
        await redis.del(subMapKey);
      }

      async function getCachedResponse(req) {
        const refreshToken = req.body.refresh_token;
        const apiKey = req.body.api_key;
        const apiSecret = req.body.api_secret;
        const key = getApiKeySecretKey(apiKey, apiSecret);

        // Skip this request as Keycloak needs to validate this request for security reasons
        if (refreshToken || !apiKey) {
          return;
        }

        // Check if cached token exists
        const response = await redis.get(key);
        if (!response) {
          return;
        }

        try {
          // Update cached response
          const responseBody = JSON.parse(response);
          const now = Math.round(Date.now() / 1000);
          responseBody.access_token_expires_in =
            responseBody.access_token_expires_at - now;
          responseBody.refresh_token_expires_in =
            responseBody.refresh_token_expires_at - now;
          return responseBody;
        } catch (e) {
          request.log.warn(e);
        }
      }

      // Get cached auth response
      try {
        const cachedResponse = await getCachedResponse(request);
        if (cachedResponse) {
          return cachedResponse;
        }
      } catch (e) {
        request.log.warn('Failed loading cache:');
        request.log.warn(e);
      }

      try {
        const { headers } = request;
        const payload: AuthenticationRequest = request.body;
        const form = {
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: KEYCLOAK_CLIENT_SECRET,
          grant_type: undefined,
          refresh_token: undefined,
          username: undefined,
          password: undefined,
          scope: undefined,
        };
        if ('refresh_token' in payload) {
          form.grant_type = 'refresh_token';
          form.refresh_token = payload.refresh_token;
        } else if ('api_key' in payload) {
          form.grant_type = 'password';
          form.username = payload.api_key;
          form.password = payload.api_secret;
        } /* istanbul ignore next */ else {
          throw createError(400, 'Invalid authentication request');
        }
        const hostname =
          request.headers['x-forwarded-host'] || request.hostname;
        const body: any = await got({
          method: 'POST',
          url: `realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
          prefixUrl: KEYCLOAK_BASE,
          form,
          headers: {
            'x-forwarded-for': headers['x-forwarded-for'],
            'x-forwarded-proto': headers['x-forwarded-proto'],

            'x-request-id': request.id,
            'request-id': request.id,
            referer: request.id,
            'user-agent': `${hostname}/api/v${majorVersion}/auth; username: ${form.username}`,
          },
          responseType: 'json',
          resolveBodyOnly: true,
        });
        const refresh_token_claims = decodeToken(body.refresh_token);
        const access_token_claims = decodeToken(body.access_token);
        const {
          env,
          organization,
          type,
          organizations = [],
        } = access_token_claims;
        if ('api_key' in payload && type === 'USER') {
          throw createError(401, 'Login with user credentials is forbidden');
        }
        let organization_id: string;
        if (organization != null) {
          organization_id = organization;
        } else {
          organization_id = organizations[0]; // TODO: "organizations" is a deprecated property!
        }

        const responsePayload = {
          access_token: body.access_token,
          access_token_claims: {
            env,
            organization_id,
          },
          access_token_expires_in: body.expires_in,
          access_token_expires_at: access_token_claims.exp,
          refresh_token: body.refresh_token,
          refresh_token_expires_in: body.refresh_expires_in,
          refresh_token_expires_at: refresh_token_claims.exp,
        };

        let key = null;
        const subMapKey = getSubMapKey(responsePayload.refresh_token);
        // Get cache key when using a refresh_token
        if ('refresh_token' in payload) {
          key = await redis.get(subMapKey);
        } else {
          key = getApiKeySecretKey(payload.api_key, payload.api_secret);
        }

        if (key) {
          // Cache response
          await redis.set(
            key,
            JSON.stringify(responsePayload),
            'EX',
            responsePayload.access_token_expires_in - 60,
          );
          await redis.set(
            subMapKey,
            key,
            'EX',
            responsePayload.refresh_token_expires_in - 60,
          );
        }
        return responsePayload;
      } catch (err) {
        if (err instanceof HTTPError) {
          const { response } = err;
          const { statusCode, statusMessage, body } = response;
          err = createError(statusCode, statusMessage, body);
        }
        await resetCacheOnInvalidRefreshToken(request);
        request.log.error(err, 'could not fetch access token from keycloak');
        reply.code(401).send(UNAUTHORIZED);
      }
    },
  });
}
