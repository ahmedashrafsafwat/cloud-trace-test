// this configures pino for usage with google cloud / stackdriver:
// - https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
// - https://cloud.google.com/error-reporting/docs/formatting-error-messages

import pino from 'pino';

const { symbols } = pino;
const { serializersSym, wildcardGsym } = symbols;

export function defaultSerializer(event) {
  const { message, stack } = event;
  if (typeof stack === 'string' && stack.length !== 0) {
    delete event.stack;
    event.message = `${message}\n${stack}`;
  }
  return event;
}

export function installDefaultSerializer(logger) {
  logger[serializersSym][wildcardGsym] = defaultSerializer;
}

function mapLevelToGcpSeverity(level) {
  switch (level) {
    case 'trace':
      return 'DEBUG';
    case 'debug':
      return 'DEBUG';
    case 'info':
      return 'INFO';
    case 'warn':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    case 'fatal':
      return 'CRITICAL';
    default:
      return 'DEFAULT';
  }
}

// do NOT use this instance, unless you know what you're doing
// instead, use the logger injected into fastify, fastify's routes or apollo!
export default pino({
  base: null, // completely useless info
  timestamp: false, // will be provided by docker
  messageKey: 'message',
  formatters: {
    level: (level) => ({ severity: mapLevelToGcpSeverity(level) }),
  },
  level: process.env.LOG_LEVEL || 'info',
  serializers: {
    [wildcardGsym]: defaultSerializer,
  },
  prettyPrint: process.env.NODE_ENV !== 'production',
});
