import { FastifyRequest, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { jwt } from 'keyfetch';
import { Env } from '../routes/api/models';

declare module 'fastify' {
  interface FastifyRequest {
    jwt?: any;
    accessToken?: string;
    token_env?: Env;
    request_id?: string;
  }

  interface FastifyInstance {
    authenticate(request: FastifyRequest): Promise<void>;
  }
}

async function authenticationPlugin(fastify: FastifyInstance) {
  const ERR_MISSING_HEADER = 'Missing Authorization header';
  const ERR_MALFORMED_AUTHORIZATION =
    'Authorization header must follow the format "Authorization: Bearer ..."';
  const ERR_MALFORMED_TOKEN = 'The token that was provided is malformed';
  const ERR_UNEXPECTED_ISSUER = 'The provided issuer has an unexpected value.';
  const issuer = `${fastify.config.KEYCLOAK_BASE}/realms/${fastify.config.KEYCLOAK_REALM}`;

  function isNonEmptyString(val) {
    return typeof val === 'string' && val.length !== 0;
  }

  async function authenticate(request: FastifyRequest) {
    try {
      const { headers = {} } = request;
      const { authorization } = headers;
      if (!isNonEmptyString(authorization)) {
        throw new Error(ERR_MISSING_HEADER);
      }
      const authorizationParts = authorization.split(' ');
      if (authorizationParts.length !== 2) {
        throw new Error(ERR_MALFORMED_AUTHORIZATION);
      }
      const [type, token] = authorizationParts;
      if (type !== 'Bearer' || !isNonEmptyString(token)) {
        throw new Error(ERR_MALFORMED_AUTHORIZATION);
      }
      request.jwt = await jwt.verify(token);
      request.accessToken = token;
      const { claims } = request.jwt;
      if (claims.iss !== issuer) {
        throw new Error(ERR_UNEXPECTED_ISSUER);
      }
      const env = ((claims && claims.env) || '').toUpperCase();
      if (!env || !['TEST', 'LIVE'].includes(env)) {
        throw new Error(ERR_MALFORMED_TOKEN);
      }
      request.token_env = env;
    } catch (err) {
      request.log.error(err);
      throw Object.assign(err, { statusCode: 401 });
    }
  }

  fastify.decorateRequest('jwt', null);
  fastify.decorateRequest('token_env', null);
  fastify.decorate('authenticate', authenticate);
}

export default fp(authenticationPlugin);
