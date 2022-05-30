import {
  Env,
  ClosingId,
  CashPointClosingResponse,
  CashPointClosingsItemResponse,
  OrganizationId,
} from '../routes/api/models';
import { selectCashPointClosing } from '../db/closing';
import { toString } from '../lib/version';
import { CashPointClosingNotFound } from '../lib/errors';
import { getCashPointClosingRequest } from './cashPointClosingRequestStore';

export const retrieveCashPointClosing = async (
  env: Env,
  organizationID: OrganizationId,
  closingId: ClosingId,
  show_details: boolean,
): Promise<CashPointClosingsItemResponse | CashPointClosingResponse> => {
  const cashPointClosing = await selectCashPointClosing(
    env,
    organizationID,
    closingId,
  );

  if (!cashPointClosing) {
    throw CashPointClosingNotFound();
  }

  const schemaCashPointClosing: CashPointClosingResponse = {
    state: cashPointClosing.state,
    error: {
      code: cashPointClosing.error_code,
      message: cashPointClosing.error_message,
    },
    time_creation: Math.floor(cashPointClosing.time_creation.getTime() / 1000),
    time_update: Math.floor(cashPointClosing.time_update.getTime() / 1000),
    metadata: cashPointClosing.metadata,
    sign_api_version: cashPointClosing.sign_api_version,
    _id: closingId,
    _type: 'CASH_POINT_CLOSING',
    _version: toString(cashPointClosing.version),
    _env: cashPointClosing.env,
  };

  if (cashPointClosing.state === 'DELETED') {
    schemaCashPointClosing.time_deleted = Math.floor(
      cashPointClosing.time_deleted.getTime() / 1000,
    );
  }

  if (cashPointClosing.state !== 'ERROR') {
    delete schemaCashPointClosing.error;
  }

  if (!show_details) {
    return {
      ...schemaCashPointClosing,
      closing_id: cashPointClosing.cash_point_closing_id,
      cash_point_closing_export_id:
        cashPointClosing.cash_point_closing_export_id,
      client_id: cashPointClosing.client_id,
      first_transaction_export_id: cashPointClosing.first_transaction_export_id,
      last_transaction_export_id: cashPointClosing.last_transaction_export_id,
      export_creation_date:
        cashPointClosing.export_creation_date &&
        Math.floor(cashPointClosing.export_creation_date.getTime() / 1000),
      full_amount: cashPointClosing.payment_full_amount,
      cash_amount: cashPointClosing.payment_cash_amount,
      sign_api_version: cashPointClosing.sign_api_version,
    } as CashPointClosingsItemResponse;
  }

  if (['PENDING', 'ERROR'].includes(cashPointClosing.state)) {
    schemaCashPointClosing.cash_point_closing = null;
    return schemaCashPointClosing;
  }

  const cashPointClosingRequest = await getCashPointClosingRequest(closingId);
  schemaCashPointClosing.cash_point_closing =
    cashPointClosingRequest.request_body;

  return schemaCashPointClosing;
};
