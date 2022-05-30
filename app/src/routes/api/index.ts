import { FastifyInstance, FastifyRequest } from 'fastify';
import openApiPlugin from '../../plugins/openapi';
import authentication from './authentication';
import openapi, { legacyBasePath } from './spec';
import cashRegisterRoutes from './cash-register';
import { removeNullValues } from '../../hooks/removeNullValues';

async function apiRoutes(fastify: FastifyInstance): Promise<void> {
  const { basePath } = openapi;

  fastify.addHook('preValidation', async (request: FastifyRequest) => {
    const { url } = request.raw;
    const isApiEndpoint = url.startsWith(`${basePath}/`);
    if (!isApiEndpoint) {
      return;
    }
    const isAuthEndpoint = url === `${basePath}/auth`;
    if (isAuthEndpoint) {
      return;
    }
    await fastify.authenticate(request);
  });

  fastify.register(authentication);

  fastify.register(cashRegisterRoutes);
}

const hide = { schema: { hide: true } };
async function apiSpecRoutes(fastify: FastifyInstance): Promise<void> {
  const { openapi } = fastify;
  const { info } = openapi;
  const { title, version } = info;
  fastify.get('/', hide, (_, reply) => {
    reply.send({
      title,
      version,
      _links: [
        {
          rel: 'help',
          href: '_docs',
          title: `${title} Documentation`,
        },
        {
          rel: 'spec',
          href: '_spec.json',
          title: `${title} Specification`,
        },
      ],
    });
  });
  fastify.get('/_docs/', hide, (_, reply) => {
    reply.sendFile('docs.html');
  });
  fastify.get('/_spec.json', hide, (_, reply) => {
    reply.header('access-control-allow-origin', '*').send(openapi);
  });
}

async function apiSpecLegacyRoutes(fastify: FastifyInstance): Promise<void> {
  const { openapi } = fastify;
  fastify.get('/', hide, (_, reply) => {
    reply.redirect(openapi.basePath);
  });
  fastify.get('/_docs/', hide, (_, reply) => {
    reply.redirect(openapi.basePath + '/_docs/');
  });
  fastify.get('/_spec.json', hide, (_, reply) => {
    reply
      .header('access-control-allow-origin', '*')
      .redirect(openapi.basePath + '/_spec.json');
  });
}

export default async function routes(fastify: FastifyInstance): Promise<void> {
  const prefix = openapi.basePath;
  const prefixLegacy = legacyBasePath;
  fastify.decorateRequest('request_id', '');
  fastify.addHook('preSerialization', removeNullValues);
  fastify.register(openApiPlugin, { prefix, openapi });
  fastify.register(apiRoutes, { prefix });
  fastify.register(apiSpecRoutes, { prefix });

  // Legacy API routes
  fastify.register(apiRoutes, { prefix: prefixLegacy });
  fastify.register(apiSpecLegacyRoutes, { prefix: prefixLegacy });
}
