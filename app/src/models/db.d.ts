import {
  Env,
  PaymentType,
  TransactionType,
  BusinessCaseType,
  SignApiVersionType,
  OrganizationId,
  SerialNumber,
  SignatureTimestampFormat,
  TransactionDataEncoding,
} from '../routes/api/models';
import {
  AmountEntryType,
  ReferenceType,
  ExternalReferenceType,
  PaymentTypeEntry,
  ExportStateType,
} from '.';

export interface AmountsPerVatIdEntity {
  amounts_per_vat_id: string;
  lineitem_id: string | null;
  transaction_id: string | null;
  business_case_id: string | null;

  vat_definition_id: string | null;
  system_vat_definition_id: string | null;
  vat_definition_export_id: string | number;

  excl_vat: number;
  vat: number;
  incl_vat: number;
  entry_type: AmountEntryType;
  cash_point_closing_id: string;
}

export interface BusinessCaseEntity {
  business_case_id: string;
  cash_point_closing_id: string | null;
  type: BusinessCaseType;
  name: string | null;
  purchaser_agency_id: string | null;
  purchaser_agency_revision: number | null;
}

export interface CashAmountsByCurrencyEntity {
  currency_code: any;
  amount: number;
  cash_point_closing_id: string;
}

export interface CashPointClosingEntity {
  cash_point_closing_id: string;
  client_id: string;
  client_revision: number;
  payment_full_amount: number;
  payment_cash_amount: number;
  env: Env;
  organization_id: OrganizationId;
  version: number;
  metadata: Record<string, any> | null;
  sign_api_version?: number;
  time_creation?: Date;
  time_update?: Date;
  cash_point_closing_export_id: number;
  first_transaction_export_id: string;
  last_transaction_export_id: string;
  export_creation_date: Date;
  business_date: Date | null;
  state: ExportStateType;
  error_code: string | null;
  error_message: string | null;
  error_details: Record<string, any> | null;
  time_start: Date | null;
  time_end: Date | null;
  time_expiration: Date | null;
  time_error: Date | null;
  time_deleted: Date | null;
  request_id: string;
}

export interface CashRegisterEntity {
  client_id: string;
  revision: number;
  tss_id: string | null;
  organization_id: string;
  base_currency_code: any;
  brand: string | null;
  model: string | null;
  sw_version: string | null;
  sw_brand: string | null;
  vat_not_determineable: boolean | null; // typo!
  master_client_id: string | null;
  version: number;
  env: Env;
  metadata: Record<string, any> | null;
  sign_api_version: number;
  time_creation?: Date;
  time_update?: Date;
  serial_number?: SerialNumber;
  signature_algorithm?: string;
  signature_timestamp_format?: SignatureTimestampFormat;
  transaction_data_encoding?: TransactionDataEncoding;
  public_key?: string;
  certificate?: string;
}

export interface ExportCashPointClosingEntity {
  export_id: string;
  cash_point_closing_id: string;
  sign_api_version?: number;
}

export interface ExportEntity {
  export_id: string;
  export_state: ExportStateType;
  input_query: Record<string, any>;
  input_query_result_hash: string;
  error_message: string | null;
  error_details: Record<string, any> | null;
  time_request: Date;
  time_start: Date | null;
  time_end: Date | null;
  time_expiration: Date | null;
  time_error: Date | null;
  download_checksum: string | null;
  metadata: Record<string, any> | null;
  sign_api_version: SignApiVersionType;
  env: Env;
  version: number;
  bucket: string | null;
  object: string | null;
  organization_id: string;
  error_code: string | null;
  cash_point_closings?: string[];
  request_id: string;
}

export interface ExternalReferenceEntity {
  external_reference_id: string;
  transaction_id: string;
  lineitem_id: string | null;
  entry_type: ReferenceType;
  type: ExternalReferenceType;
  external_reference_export_id: string;
  name: string | null;
  date: Date | null;
}

export interface LineitemInternalReferenceEntity {
  lineitem_id: string;
  referenced_transaction_id: string;
  // TODO: Probably would also need the current cash_point_closing_id
  //       and referenced_cash_point_closing_id
}

export interface LineitemEntity {
  lineitem_id: string;
  lineitem_export_id: string;
  transaction_id: string;
  business_case_type: BusinessCaseType;
  business_case_name: string | null;
  purchaser_agency_id: string | null;
  purchaser_agency_revision: number | null;
  storno: boolean;
  text: string;
  in_house?: boolean | null;
  voucher_id: string | null;
  item_number: string | null;
  quantity: number | null;
  price_per_unit: number | null;
  gtin: string | null;
  quantity_factor: number | null;
  quantity_measure: string | null;
  group_id: string | null;
  group_name: string | null;
  reference_transaction_id: string | null;
  cash_point_closing_id: string;
}

export interface MigrationEntity {
  id?: number;
  name: string;
  created_at: Date;
}

export interface PaymentTypeEntity {
  payment_type_id: string;
  transaction_id: string | null;
  cash_point_closing_id: string | null;
  entry_type: PaymentTypeEntry;
  type: PaymentType;
  currency_code: any;
  amount: number;
  name: string | null;
  foreign_amount: number | null;
}

// typo:
export interface PurchaserAgencieEntity {
  purchaser_agency_id: string;
  revision: number;
  purchaser_agency_export_id: number;
  organization_id: string;
  name: string;
  tax_number: string;
  client_id: string;
  address: Record<string, any>;
  vat_id_number: string | null;
  env: Env;
  version: number;
  metadata: Record<string, any> | null;
  time_creation?: Date;
  time_update?: Date;
  sign_api_version: number;
}

export interface RequestEntity {
  request_id: string;
  path: string;
  body: Record<string, any>;
  time_creation?: Date;
  organization_id: string;
  env: Env;
  version: number;
}

export interface SubitemEntity {
  subitem_id: string;
  lineitem_id: string;
  number: string;
  quantity: number;
  vat_definition_id: string | null;
  amount_excl_vat: number;
  vat_amount: number;
  gtin: string | null;
  name: string | null;
  quantity_factor: number | null;
  quantity_measure: string | null;
  group_id: string | null;
  group_name: string | null;
  amount_incl_vat: number;
  system_vat_definition_id: string | null;
  vat_definition_export_id: string | number;
  cash_point_closing_id: string;
}

export interface SystemVatDefinitionEntity {
  vat_definition_id: string;
  vat_definition_export_id: any;
  percentage: number;
  description: string | null;
  env: any;
  time_creation?: Date;
  time_update?: Date;
  validity: any;
  dsfinvk_version: string;
  historic_export_id: any | null;
}

export interface TransactionInternalReferenceEntity {
  transaction_id: string;
  referenced_transaction_id: string;
  // TODO: Currently not being used
  cash_point_closing_id: string;
  referenced_cash_point_closing_id: string;
}

export interface TransactionReferenceEntity {
  transaction_reference_id: string;
  transaction_id: string;
  lineitem_id: string | null;
  entry_type: ReferenceType;
  cash_point_closing_export_id: number;
  cash_register_id: string;
  transaction_export_id: string;
  date: Date | null;
}

export interface TransactionExternalTss {
  tx_number?: string;
  tx_start?: string;
  tx_end?: string;
  process_type?: process_type;
  process_data?: string;
  signature_counter?: string;
  signature?: string;
  error_message?: string;
}
export interface TransactionEntity extends TransactionExternalTss {
  transaction_id: string;
  cash_point_closing_id: string;
  tse_tx_id: string | null;
  tx_id: string | null;
  type: TransactionType;
  storno: boolean;
  transaction_export_id: string;
  bon_number: number;
  timestamp_start: Date;
  timestamp_end: Date;
  name: string | null;
  user_id: string;
  user_name: string | null;
  buyer: Record<string, any>;
  allocation_groups: Record<string, any> | string | null;
  full_amount_incl_vat: number;
  notes: string | null;
  error_message: string | null;
  closing_client_id: string;
  closing_client_revision: number;
}

export interface VatDefinitionEntity {
  vat_definition_id: string;
  revision: number;
  vat_definition_export_id: number;
  organization_id: string;
  percentage: number;
  description: string | null;
  env: Env;
  version: number;
  metadata: Record<string, any> | null;
  time_creation?: Date;
  time_update?: Date;
}

export enum environment {
  TEST = 'TEST',
  LIVE = 'LIVE',
}

export enum tx_type {
  Beleg = 'Beleg',
  AVTransfer = 'AVTransfer',
  AVBestellung = 'AVBestellung',
  AVTraining = 'AVTraining',
  AVBelegstorno = 'AVBelegstorno',
  AVBelegabbruch = 'AVBelegabbruch',
  AVSachbezug = 'AVSachbezug',
  AVSonstige = 'AVSonstige',
  AVRechnung = 'AVRechnung',
}

export enum type_cpc_t {
  cash_point_closing = 'cash_point_closing',
  transaction = 'transaction',
}

export enum type_t_li {
  transaction = 'transaction',
  lineitem = 'lineitem',
}

export enum payment_type {
  Bar = 'Bar',
  Unbar = 'Unbar',
  ECKarte = 'ECKarte',
  Kreditkarte = 'Kreditkarte',
  ElZahlungsdienstleister = 'ElZahlungsdienstleister',
  GuthabenKarte = 'GuthabenKarte',
  Keine = 'Keine',
}

export enum business_case_type {
  Anfangsbestand = 'Anfangsbestand',
  Umsatz = 'Umsatz',
  Pfand = 'Pfand',
  PfandRueckzahlung = 'PfandRueckzahlung',
  MehrzweckgutscheinKauf = 'MehrzweckgutscheinKauf',
  MehrzweckgutscheinEinloesung = 'MehrzweckgutscheinEinloesung',
  EinzweckgutscheinKauf = 'EinzweckgutscheinKauf',
  EinzweckgutscheinEinloesung = 'EinzweckgutscheinEinloesung',
  Forderungsentstehung = 'Forderungsentstehung',
  Forderungsaufloesung = 'Forderungsaufloesung',
  Anzahlungseinstellung = 'Anzahlungseinstellung',
  Anzahlungsaufloesung = 'Anzahlungsaufloesung',
  Privateinlage = 'Privateinlage',
  Privatentnahme = 'Privatentnahme',
  Geldtransit = 'Geldtransit',
  DifferenzSollIst = 'DifferenzSollIst',
  TrinkgeldAG = 'TrinkgeldAG',
  TrinkgeldAN = 'TrinkgeldAN',
  Auszahlung = 'Auszahlung',
  Einzahlung = 'Einzahlung',
  Rabatt = 'Rabatt',
  Aufschlag = 'Aufschlag',
  Lohnzahlung = 'Lohnzahlung',
  ZuschussEcht = 'ZuschussEcht',
  ZuschussUnecht = 'ZuschussUnecht',
}

export enum external_references_type {
  ExterneRechnung = 'ExterneRechnung',
  ExternerLieferschein = 'ExternerLieferschein',
  ExterneSonstige = 'ExterneSonstige',
}

export enum amount_type {
  transaction = 'transaction',
  business_case = 'business_case',
  lineitem_base_amounts = 'lineitem_base_amounts',
  lineitem_discounts = 'lineitem_discounts',
  lineitem_extra_amounts = 'lineitem_extra_amounts',
  lineitem_business_case = 'lineitem_business_case',
}

export enum export_state {
  PENDING = 'PENDING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
  ERROR = 'ERROR',
}

export enum process_type {
  KassenbelegV1 = 'Kassenbeleg-V1',
  BestellungV1 = 'Bestellung-V1',
  SonstigerVorgang = 'SonstigerVorgang',
}
