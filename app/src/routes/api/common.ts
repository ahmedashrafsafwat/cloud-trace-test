import { STATUS_CODES } from 'http';
import createError from 'http-errors';

export const createErrorCode = (codes = []) => {
  const code = {
    type: 'string',
    const: undefined,
    enum: undefined,
    example: undefined,
  };
  if (codes.length > 0) {
    const first = codes[0];
    if (codes.length === 1) {
      code.const = first;
    } else {
      code.enum = codes;
    }
    code.example = first;
  }
  return code;
};

export const createHttpErrorType = (
  statusCode: number,
  description: string,
  codes: string[] = [],
) => ({
  type: 'object',
  description,
  properties: {
    code: createErrorCode(codes),
    message: {
      type: 'string',
    },
    status_code: {
      type: 'number',
      example: statusCode,
    },
    error: {
      type: 'string',
      example: STATUS_CODES[statusCode],
    },
  },
});

export const E_FORBIDDEN = (message = 'Forbidden.') =>
  createError(403, message, {
    code: 'E_FORBIDDEN',
  });

export const E_NOT_FOUND = (message = 'Not Found.') =>
  createError(404, message, {
    code: 'E_NOT_FOUND',
  });

export const E_BAD_REQUEST = (message = 'Bad Request.') =>
  createError(400, message, {
    code: 'E_BAD_REQUEST',
  });

export const E_NOT_IMPLEMENTED = (message = 'Not Implemented.') =>
  createError(501, message, {
    code: 'E_NOT_IMPLEMENTED',
  });

export const E_TOO_MANY_ORGANIZATIONS = createError(
  400,
  'The current user/key is assigned to too many organizations.',
  { code: 'E_TOO_MANY_ORGANIZATIONS' },
);

export const E_INVALID_INTEGRATION_TOKEN = createError(
  400,
  'Missing or invalid token.',
  { code: 'E_INVALID_INTEGRATION_TOKEN' },
);

export const E_API_KEY_ALREADY_EXISTS = createError(
  409,
  'API Key already exists.',
  { code: 'E_API_KEY_ALREADY_EXISTS' },
);

export const E_USER_ALREADY_IN_ORGANIZATION = createError(
  409,
  'User already in organization.',
  { code: 'E_USER_ALREADY_IN_ORGANIZATION' },
);

export const E_ORGANIZATION_NOT_FOUND = createError(
  404,
  'Organization not found.',
  { code: 'E_ORGANIZATION_NOT_FOUND' },
);

export const E_ORGANIZATION_NOT_GIVEN = createError(
  400,
  'Organization id was not given.',
  { code: 'E_ORGANIZATION_NOT_GIVEN' },
);

export const E_BILLING_ADDRESS_NOT_FOUND = createError(
  404,
  'Organization not found.',
  { code: 'E_BILLING_ADDRESS_NOT_FOUND' },
);

export const E_NO_VALID_BILLING_ADDRESS = createError(
  400,
  'No valid billing address found.',
  { code: 'E_NO_VALID_BILLING_ADDRESS' },
);
