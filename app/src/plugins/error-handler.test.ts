import test from 'ava';
import createError from 'http-errors';
import Fastify from 'fastify';
import errorHandlerPlugin from './error-handler';

async function buildFastify(error?: Error, env = 'test') {
  const fastify = Fastify();
  process.env.NODE_ENV = env;
  fastify.register(errorHandlerPlugin);
  if (error != null) {
    fastify.get('/', async () => {
      throw error;
    });
  }
  await fastify.ready();
  return fastify;
}

test('not found handler', async (t) => {
  const fastify = await buildFastify();
  const res = await fastify.inject('/does-not-exist');
  t.is(res.statusCode, 404);
  const body = JSON.parse(res.payload);
  t.deepEqual(body, {
    status_code: 404,
    error: 'Not Found',
    code: 'E_NOT_FOUND',
    message: 'Path does not exist',
  });
});

test('error handler', async (t) => {
  const internalMessage = 'do not leak this message';

  // err1
  {
    const err = new Error(internalMessage);
    const fastify = await buildFastify(err);
    const { statusCode, payload } = await fastify.inject('/');
    t.is(statusCode, 500);
    t.deepEqual(JSON.parse(payload), {
      status_code: 500,
      error: 'Internal Server Error',
      message: internalMessage,
    });
    await fastify.close();
  }

  // err2
  {
    const err = Object.assign(new Error(internalMessage), {
      code: 'CODE',
      some: 'hidden',
      properties: 'yay',
    });
    const fastify = await buildFastify(err);
    const { statusCode, payload } = await fastify.inject('/');
    t.is(statusCode, 500);
    t.deepEqual(JSON.parse(payload), {
      status_code: 500,
      error: 'Internal Server Error',
      code: 'CODE',
      message: internalMessage,
    });
    await fastify.close();
  }

  // err3
  {
    const err = createError(409, 'this error is public', {
      code: 'CODE',
      some: 'hidden',
      properties: 'yay',
    });
    const fastify = await buildFastify(err);
    const { statusCode, payload } = await fastify.inject('/');
    t.is(statusCode, 409);
    t.deepEqual(JSON.parse(payload), {
      status_code: 409,
      error: 'Conflict',
      code: 'CODE',
      message: 'this error is public',
    });
    await fastify.close();
  }

  // err4
  {
    const err = createError(409);
    const fastify = await buildFastify(err);
    const { statusCode, payload } = await fastify.inject('/');
    t.is(statusCode, 409);
    t.deepEqual(JSON.parse(payload), {
      status_code: 409,
      error: 'Conflict',
      message: 'Conflict',
    });
    await fastify.close();
  }

  // production should not leak secret message
  {
    const err = new Error(internalMessage);
    const fastify = await buildFastify(err, 'production');
    const { statusCode, payload } = await fastify.inject('/');
    t.is(statusCode, 500);
    t.deepEqual(JSON.parse(payload), {
      status_code: 500,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
    });
    await fastify.close();
  }
});

test('validation errors', async (t) => {
  const fastify = Fastify();
  process.env.NODE_ENV = 'production';
  fastify.register(errorHandlerPlugin);
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
        required: ['foo'],
      },
    },
    handler: async () => ({}),
  });
  await fastify.ready();

  const response = await fastify.inject({
    url: '/',
    method: 'POST',
    payload: { bar: false },
  });
  t.is(response.statusCode, 400);
  const payload = JSON.parse(response.payload);
  t.deepEqual(payload, {
    status_code: 400,
    code: 'E_FAILED_SCHEMA_VALIDATION',
    error: 'Bad Request',
    message: "body should have required property 'foo'",
  });
  await fastify.close();
});
