import fp from 'fastify-plugin';
import traverse from 'traverse';
import { RegisterOptions, FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { legacyBasePath } from '../routes/api/spec';

const whitelistedRouteProperties = new Set([
  'operationId',
  'summary',
  'description',
  'tags',
  'produces',
  'consumes',
  'deprecated',
  'security',
]);

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function createTypeError(message, props) {
  return new TypeError(`${message}:\n${JSON.stringify(props, null, 2)}`);
}

function transform(value) {
  if (this.key === '$name' || typeof value === 'undefined') {
    return this.remove();
  }
  if (this.key === '$ref') {
    // transform reference to a local reference
    const localRef = '#' + value.split('#').pop();
    return this.update(localRef);
  }
  if (this.key === 'hide' && value) {
    return this.parent.remove();
  }
}

function transformRecursively(value) {
  traverse(value).forEach(transform);
}

function formatParameterUrl(url) {
  // The swagger standard does not accept the url param with ':'
  // so '/user/:id' is not valid.
  // This function converts the url in a swagger compliant url string
  // => '/user/{id}'
  let start = url.indexOf('/:');
  if (start === -1) {
    return url;
  }
  const end = url.indexOf('/', ++start);
  if (end === -1) {
    return url.slice(0, start) + '{' + url.slice(++start) + '}';
  }
  return formatParameterUrl(
    url.slice(0, start) + '{' + url.slice(++start, end) + '}' + url.slice(end),
  );
}

function createOperation(paths, methods, url) {
  const path = formatParameterUrl(url);
  if (paths[path] == null) {
    paths[path] = {};
  }
  const pathItem = paths[path];
  const operation = {
    parameters: [],
    responses: {},
  };
  const method = Array.isArray(methods) ? methods[0] : methods;
  pathItem[method.toLowerCase()] = operation;
  return operation;
}

function addResponses(operation, routeSchema) {
  const { response } = routeSchema;
  if (response == null) {
    throw createTypeError('response must be defined', routeSchema);
  }
  const { responses } = operation;
  for (const [code, value] of Object.entries(response)) {
    const {
      description = 'Default Response', // TODO: throw error if no description is set!
      ...schema
    } = value as any;
    responses[code] = clone({ description, schema });
  }
}

function addRouteProperties(operation, routeSchema) {
  for (const [key, value] of Object.entries(routeSchema)) {
    const isWhitelistedKey = whitelistedRouteProperties.has(key);
    const isXPrefixedKey = /^x-/i.test(key);
    if (!isWhitelistedKey && !isXPrefixedKey) {
      continue;
    }
    const isValueDefined = value != null;
    if (!isValueDefined) {
      continue;
    }
    operation[key] = value;
  }
}

function addBodyParameters(operation, routeSchema) {
  const { body } = routeSchema;
  if (body == null) {
    return;
  }
  const { description, ...schema } = body;
  const parameter = clone({
    description,
    name: 'body',
    in: 'body',
    schema,
  });
  operation.parameters.push(parameter);
}

function addParameters(operation, routeSchema, prop, props) {
  const obj = routeSchema[prop];
  if (obj == null) {
    return;
  }
  const { description, properties } = obj;
  if (properties == null) {
    return;
  }
  for (const entry of Object.entries(properties)) {
    const [name, value]: [string, any] = entry;
    if ('$ref' in value) {
      throw createTypeError(`$ref not allowed in ${prop} parameters`, obj);
    }
    if (value.hide) {
      continue;
    }
    const parameter = clone({
      ...value,
      name,
      description,
      ...props,
    });
    operation.parameters.push(parameter);
  }
}

function addPathParameters(operation, routeSchema) {
  return addParameters(operation, routeSchema, 'params', {
    in: 'path',
    required: true,
  });
}

function addQueryParameters(operation, routeSchema) {
  return addParameters(operation, routeSchema, 'querystring', { in: 'query' });
}

declare module 'fastify' {
  interface FastifyInstance {
    openapi: any;
  }
  interface RouteSchema {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    hide?: boolean;
  }
}

export interface OpenApiPluginOptions
  extends RegisterOptions<Server, IncomingMessage, ServerResponse> {
  openapi: any;
}

async function openapiPlugin(
  fastify: FastifyInstance,
  opts: OpenApiPluginOptions,
) {
  // eslint-disable-next-line
  const { _$id, _definitions, basePath, ...rest } = opts.openapi;
  const spec = clone({
    swagger: '2.0',
    basePath,
    ...rest,
    paths: {},
    // definitions,
  });

  //todo: what do we need this transformation for?

  // transformRecursively(spec.definitions);

  // fastify.addSchema({ $id, definitions });

  fastify.decorate('openapi', spec);

  fastify.addHook('onRoute', (route) => {
    const { schema, method, url } = route;
    if (schema == null || schema.hide || route.prefix === legacyBasePath) {
      return; // skip this route
    }
    const pathUrl = url.startsWith(basePath) ? url.replace(basePath, '') : url;
    const operation = createOperation(spec.paths, method, pathUrl);
    addRouteProperties(operation, schema);
    addResponses(operation, schema);
    addBodyParameters(operation, schema);
    addPathParameters(operation, schema);
    addQueryParameters(operation, schema);
    transformRecursively(operation);
  });
}

export default fp(openapiPlugin);
