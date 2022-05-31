// install an 'unhandledRejection' handler:
import Fastify from 'fastify';
// import logger, { installDefaultSerializer } from './lib/logger';
import app from './app';
import ajvFormats from 'ajv-formats';
import * as TraceAgent from '@google-cloud/trace-agent';

const tracer = TraceAgent.start({
  samplingRate: 1000, // sample 5 traces per second, or at most 1 every 200 milliseconds.
  projectId: 'fiskaly',
  // keyFilename: '',
  ignoreUrls: [/^\/vat_definitions/, /^\/purchaser_agencies/], // ignore the "/ignore-me" endpoint.
  ignoreMethods: ['get'], // ignore requests with OPTIONS method (case-insensitive).
});

export { tracer };

export const server = Fastify({
  // logger,
  disableRequestLogging: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'request_id',
  pluginTimeout: 10000,
  bodyLimit: 1048576 * 100, // = 100MiB https://www.fastify.io/docs/latest/Server/#bodylimit
  trustProxy: true,
});
import Ajv from 'ajv';

const ajv = new Ajv({
  removeAdditional: true,
  multipleOfPrecision: 5,
  strict: false,
  useDefaults: true,
  coerceTypes: true,
});

ajvFormats(ajv);

server.setSchemaCompiler(function (schema) {
  return ajv.compile(schema);
});

// fastify somehow kills our default serializer during initialization
// that's we we have to re-add it again:
// installDefaultSerializer(server.log);

server.register(app);

export default server;

// start a server if server.ts is executed directly
// e.g. via: npx ts-node src/server.ts
if (require.main === module) {
  // make sure that everything gets logged via our pino logger:
  // console.log = console.info = logger.info.bind(logger);
  // console.warn = logger.warn.bind(logger);
  // console.error = logger.error.bind(logger);
  // run server:
  const opts = {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
  };
  server.listen(opts, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}
