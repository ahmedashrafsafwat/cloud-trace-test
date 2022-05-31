import path from 'path';
import serve from 'fastify-static';
import cors from 'fastify-cors';
// import redis from 'fastify-redis';
import authentication from './plugins/authentication';
import requestId from './plugins/request-id';
import errorHandler from './plugins/error-handler';
import routes from './routes';
import config from './config';
import { initMetrics } from './lib/metrics';
import secureJSON from 'secure-json-parse';

declare module 'fastify' {
  interface FastifyInstance {
    config: { [key: string]: any };
  }
}

export default async function app(fastify) {
  await initMetrics();

  fastify.decorate('config', config);

  fastify.register(cors, {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'X-Request-ID',
    maxAge: 86400,
  });

  fastify.register(errorHandler);

  fastify.register(requestId);

  // fastify.register(redis, {
  //   host: config.REDIS_HOST,
  //   port: config.REDIS_PORT || 6379,
  //   connectTimeout: config.REDIS_CONNECTION_TIMEOUT,
  //   maxRetriesPerRequest: config.REDIS_MAX_RETRIES_PER_REQUEST,
  //   // closeClient: true,
  // });

  fastify.register(authentication);

  fastify.register(serve, {
    root: path.join(__dirname, '..', 'public'),
    serve: false,
  });

  const publicFolders = ['postman', 'dsfinvk'];
  for (const publicFolder of publicFolders) {
    const publicFolderConfig = {
      root: path.join(__dirname, '..', `public/${publicFolder}`),
      setHeaders: (res) => {
        res.setHeader('Content-Disposition', 'attachment');
      },
      decorateReply: false,
    };
    fastify.register(serve, {
      ...publicFolderConfig,
      prefix: `/api/v1/_docs/${publicFolder}/`,
    });
    fastify.register(serve, {
      ...publicFolderConfig,
      prefix: `/api/v0/_docs/${publicFolder}/`,
    });
  }

  // Custom contentTypeParser to prevent cash point closings from getting parsed right away
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function (request, payload, done) {
      const { url, method } = request;
      if (
        method.toLowerCase() === 'put' &&
        /^\/api\/v\d+\/cash_point_closing/.test(url) &&
        url.indexOf('metadata') === -1
      ) {
        return done(null, payload);
      }

      try {
        const parsed = secureJSON.safeParse(payload);
        done(null, parsed);
      } catch (err) {
        done(err);
      }
    },
  );

  fastify.register(routes);

  if (process.env.NODE_ENV === 'development') {
    fastify.ready(() => {
      console.log(fastify.printRoutes());
    });
  }
}
