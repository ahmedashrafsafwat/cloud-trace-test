import { RouteShorthandOptions, RouteSchema } from 'fastify';
import {
  Env,
  ClientId,
  TssId,
  CashPointClosing,
  OrganizationId,
} from '../routes/api/models';
import { Organization } from '../services/Management';

export interface RouteShorthandOptionsOperationId
  extends RouteShorthandOptions {
  schema?: RouteSchemaOperationId;
}

export interface RouteSchemaOperationId extends RouteSchema {
  operationId: string;
}

export type AmountEntryType =
  | 'transaction'
  | 'business_case'
  | 'lineitem_business_case'
  | 'lineitem_base_amounts'
  | 'lineitem_discounts'
  | 'lineitem_extra_amounts';

export type PaymentTypeEntry = 'transaction' | 'cash_point_closing';

export type ExternalReferenceType =
  | 'ExterneRechnung'
  | 'ExternerLieferschein'
  | 'ExterneSonstige';

export type ReferenceType = 'transaction' | 'lineitem';

export type ExportStateType =
  | 'PENDING'
  | 'WORKING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DELETED'
  | 'ERROR';

export interface SignQueueMessage {
  exportId: string;
  transactionIds: string[];
  clients: { clientId: ClientId; tssId: TssId }[];
  organization: Organization;
  env: Env;
}

export interface ExportQueueMessage {
  exportId: string;
  transactions: TransactionSecurity[];
  clients: TSS[];
  organization: Organization;
  error?: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface ClosingSignTransactions {
  transactionId: string;
  clientId: ClientId;
  tssId: TssId;
}

export interface ClosingSignQueueMessage {
  closingId: string;
  cash_point_closing: CashPointClosing;
  transactions: ClosingSignTransactions[];
  organizationId: OrganizationId;
  env: Env;
}

export interface ClosingQueueMessage {
  closingId: string;
  cash_point_closing: CashPointClosing;
  organizationId: OrganizationId;
  env: Env;
  error?: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

type SignatureAlgorithm =
  | 'ecdsa-plain-SHA224'
  | 'ecdsa-plain-SHA256'
  | 'ecdsa-plain-SHA384'
  | 'ecdsa-plain-SHA512'
  | 'ecdsa-plain-SHA3-224'
  | 'ecdsa-plain-SHA3-256'
  | 'ecdsa-plain-SHA3-384'
  | 'ecdsa-plain-SHA3-512'
  | 'ecsdsa-plain-SHA224'
  | 'ecsdsa-plain-SHA256'
  | 'ecsdsa-plain-SHA384'
  | 'ecsdsa-plain-SHA512'
  | 'ecsdsa-plain-SHA3-224'
  | 'ecsdsa-plain-SHA3-256'
  | 'ecsdsa-plain-SHA3-384'
  | 'ecsdsa-plain-SHA3-512';

type LogTimeFormat =
  | 'unixTime'
  | 'utcTime'
  | 'utcTimeWithSeconds'
  | 'generalizedTime'
  | 'generalizedTimeWithMilliseconds';

type TSS = {
  clientId: string;
  tssId: string;
  clientSerialNumber: string; // § 146a Abs. 4 AO
  certificateSerial: string; // TR-03153 Abschnitt 7.5. Octet-String in Hexadezimal-Darstellung
  signatureAlgorithm: SignatureAlgorithm;
  signatureTimestampFormat: LogTimeFormat;
  transactionDataEncoding: 'UTF-8' | 'ASCII';
  publicKey: string;
  certificate: string;
};

type TransactionSecurity = {
  txId: string;
  tssId: string;
  clientId: string;
  transactionNumber: number;
  transactionLogStart: number;
  transactionLogFinish: number;
  processType: string;
  signatureCounter: number;
  signature: string; // base64
  processData?: string;
};
