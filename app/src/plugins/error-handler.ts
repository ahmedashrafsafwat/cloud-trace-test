import fp from 'fastify-plugin';
import { STATUS_CODES } from 'http';
import { FastifyInstance } from 'fastify';

async function errorHandlerPlugin(fastify: FastifyInstance) {
  let formatErrorMessage;

  const isProduction = /production/i.test(process.env.NODE_ENV);
  if (isProduction) {
    formatErrorMessage = (message, statusCode) => {
      if (statusCode == null || statusCode >= 500) {
        return 'Internal Server Error';
      } else {
        return message;
      }
    };
  } else {
    formatErrorMessage = (message) => message;
  }

  fastify.setNotFoundHandler(async (request, reply) => {
    request.log.warn('not found');
    return reply.code(404).send({
      status_code: 404,
      error: 'Not Found',
      code: 'E_NOT_FOUND',
      message: 'Path does not exist',
    });
  });

  fastify.setErrorHandler(async (err: any, request) => {
    request.log.error(err);

    let defaultCode;
    let defaultStatusCode = 500;

    const isValidationError = Array.isArray(err.validation);
    if (isValidationError) {
      defaultCode = 'E_FAILED_SCHEMA_VALIDATION';
      defaultStatusCode = 400;
    }

    const { statusCode = defaultStatusCode, code = defaultCode } = err;
    const error = STATUS_CODES[statusCode];
    const message = formatErrorMessage(err.message, statusCode);

    return {
      status_code: statusCode,
      error,
      code,
      message,
    };
  });
}

export default fp(errorHandlerPlugin);
