import createError from 'http-errors';
import constants from '../constants';

interface ErrorObject {
  code: string;
  client_id?: string;
}

export function ErrorWithErrorCode(code: string, message: string) {
  this.name = 'ErrorWithErrorCode';
  this.code = code;
  this.message = message;
}

export function BadRequest(message = 'Bad Request') {
  return createError(400, message, { code: constants.E_BAD_REQUEST });
}

export function TransactionsMissing(
  httpCode = 400,
  message = 'Transactions are missing.',
  client_id?: string,
) {
  const errObj: ErrorObject = {
    code: constants.E_TRANSACTIONS_MISSING,
  };
  if (client_id) {
    errObj.client_id = client_id;
  }

  return createError(httpCode, message, errObj);
}

export function ClientNotFound(
  httpCode = 404,
  message = 'Client does not exist.',
) {
  return createError(httpCode, message, { code: constants.E_CLIENT_NOT_FOUND });
}

export function CashRegisterNotFound(client_id?: string) {
  const message =
    'Cash Register does not exist! Check for a matching sign_api_version.' +
    (client_id ? ` (${client_id})` : '');

  const errObj: ErrorObject = {
    code: constants.E_CASH_REGISTER_NOT_FOUND,
  };
  if (client_id) {
    errObj.client_id = client_id;
  }

  return createError(404, message, errObj);
}

export function CashRegisterConflict() {
  const message =
    'Cash Register already exists with a different sign_api_version.';
  return createError(409, message, {
    code: constants.E_CASH_REGISTER_CONFLICT,
  });
}

export function VatDefinitionNotFound(vatDefinitionExportId?: number | string) {
  const message = `VAT Definition does not exist.${
    vatDefinitionExportId && ` (${vatDefinitionExportId})`
  }`;
  return createError(404, message, {
    code: constants.E_VAT_DEFINITION_NOT_FOUND,
  });
}

export function PurchaserAgencyNotFound(
  httpCode = 404,
  message = 'Purchaser Agency does not exist.',
) {
  return createError(httpCode, message, {
    code: constants.E_PURCHASER_AGENCY_NOT_FOUND,
  });
}

export function CashPointClosingConflict(
  httpCode = 409,
  message = 'Cash Point Closing conflict.',
) {
  return createError(httpCode, message, {
    code: constants.E_CASH_POINT_CLOSING_CONFLICT,
  });
}

export function CashPointClosingNotFound(
  httpCode = 404,
  message = 'Cash Point Closing does not exist.',
  client_id?,
) {
  const errObj: ErrorObject = {
    code: constants.E_CASH_POINT_CLOSING_NOT_FOUND,
  };
  if (client_id) {
    errObj.client_id = client_id;
  }

  return createError(httpCode, message, errObj);
}

export function CashPointClosingsNotFound(
  httpCode = 404,
  message = 'No Cash Point Closings for the given parameters.',
) {
  return createError(httpCode, message, {
    code: constants.E_CASH_POINT_CLOSING_NOT_FOUND,
  });
}

export function CashPointClosingInvalidStateChange(
  httpCode = 400,
  message = `Bad Request. Invalid CashPointClosing state change request.`,
) {
  return createError(httpCode, message, {
    code: constants.E_INVALID_STATE_CHANGE,
  });
}

export function ExportNotFound(
  httpCode = 404,
  message = 'Export does not exist.',
) {
  return createError(httpCode, message, {
    code: constants.E_EXPORT_NOT_FOUND,
  });
}

export function ExportConflict(
  httpCode = 409,
  message = 'Export ID has already been used.',
) {
  return createError(httpCode, message, { code: constants.E_EXPORT_CONFLICT });
}

export function DownloadNotFound(
  httpCode = 404,
  message = 'Download does not exist.',
) {
  return createError(httpCode, message, {
    code: constants.E_DOWNLOAD_NOT_FOUND,
  });
}

export function PaymentTypesEmpty(
  httpCode = 400,
  message = 'Payment types are empty',
  client_id?: string,
) {
  const errObj: ErrorObject = {
    code: constants.E_FAILED_SCHEMA_VALIDATION,
  };
  if (client_id) {
    errObj.client_id = client_id;
  }

  return createError(httpCode, message, errObj);
}
