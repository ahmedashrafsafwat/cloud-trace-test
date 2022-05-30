/* tslint:disable */

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "hidden_string".
 */
export type HiddenString = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "env".
 */
export type Env = 'TEST' | 'LIVE';
/**
 * Available environments
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "envs".
 */
export type Envs = Env[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "version".
 */
export type Version = string;
/**
 * Number of available data items
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "count".
 */
export type Count = number;

export type ExportOrderBy =
  | 'state'
  | 'time_request'
  | 'time_start'
  | 'time_completed'
  | 'time_error'
  | 'version';
/**
 * ID of the Organization
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "organization_id".
 */
export type OrganizationId = string;
/**
 * ID of the API Key
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "api_key_id".
 */
export type ApiKeyId = string;
/**
 * Key of an API Key
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "api_key_key".
 */
export type ApiKeyKey = string;
/**
 * Secret of an API Key (only given, when `POST` request)
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "api_key_secret".
 */
export type ApiKeySecret = string;
/**
 * A token used for refreshing Tokens
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "refresh_token".
 */
export type RefreshToken = string;
/**
 * ID of the User
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "user_id".
 */
export type UserId = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "authentication_request".
 */
export type AuthenticationRequest =
  | ApiKeyAuthentication
  | RefreshTokenAuthentication;
/**
 * A timestamp / point in time, measured in seconds since the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time)
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "unix_timestamp".
 */
export type UnixTimestamp = number;
/**
 * The UUID of the client in KassenSichV API
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "client_id".
 */
export type ClientId = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "create_error".
 */
export type CreateError = unknown;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "create_http_error".
 */
export type CreateHttpError = unknown;
/**
 * Revision of the Masterdata
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "revision".
 */
export type Revision = number;

export type SignApiVersionType = number;

/**
 * The UUID of the TSE in KassenSichV API
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tss_id".
 */
export type TssId = string;
/**
 * Each cash statement has only one base currency. The base currency specification refers to the base currency of the cash register. The base currency is represented according to ISO 4217 (column: ISO code) Ex: Euro = EUR; All payments in foreign currency on the single document are converted to the base currency in the cash statement.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "currency".
 */
export type Currency =
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AWG'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BOV'
  | 'BRL'
  | 'BSD'
  | 'BTN'
  | 'BWP'
  | 'BYN'
  | 'BYR'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHE'
  | 'CHF'
  | 'CHW'
  | 'CLF'
  | 'CLP'
  | 'CN'
  | 'COP'
  | 'COU'
  | 'CRC'
  | 'CUC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'GBP'
  | 'GEL'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRO'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MXV'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIO'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SSP'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'STD'
  | 'SVC'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'UYI'
  | 'UYU'
  | 'UZS'
  | 'VEF'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XCD'
  | 'XOF'
  | 'XPF'
  | 'XSU'
  | 'YER'
  | 'ZAR'
  | 'ZMW'
  | 'ZWL';
/**
 * The UUID of the client in KassenSichV API or a self-generated UUID of a slave
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "client_or_slave_id".
 */
export type ClientOrSlaveId = string;
/**
 * ID of the cash point closing
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "closing_id".
 */
export type ClosingId = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "business_case_type".
 */
export type BusinessCaseType =
  | 'Anfangsbestand'
  | 'Umsatz'
  | 'Pfand'
  | 'PfandRueckzahlung'
  | 'MehrzweckgutscheinKauf'
  | 'MehrzweckgutscheinEinloesung'
  | 'EinzweckgutscheinKauf'
  | 'EinzweckgutscheinEinloesung'
  | 'Forderungsentstehung'
  | 'Forderungsaufloesung'
  | 'Anzahlungseinstellung'
  | 'Anzahlungsaufloesung'
  | 'Privateinlage'
  | 'Privatentnahme'
  | 'Geldtransit'
  | 'DifferenzSollIst'
  | 'TrinkgeldAG'
  | 'TrinkgeldAN'
  | 'Auszahlung'
  | 'Einzahlung'
  | 'Rabatt'
  | 'Aufschlag'
  | 'Lohnzahlung'
  | 'ZuschussEcht'
  | 'ZuschussUnecht';
/**
 * The UUID of the purchasing agency.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency_id".
 */
export type PurchaserAgencyId = string;
/**
 * Fixed sales tax references are assigned here. Tax rates 1-7 are fixed, 8-999 are reserved, and 1000-99999999 are available for free use.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_export_id".
 */
export type VatDefinitionExportId = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_amounts_gross_and_net".
 */
export type VatAmountsGrossAndNet = VatAmountGrossAndNet[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "amount".
 */
export type Amount = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "payment_type".
 */
export type PaymentType =
  | 'Bar'
  | 'Unbar'
  | 'ECKarte'
  | 'Kreditkarte'
  | 'ElZahlungsdienstleister'
  | 'GuthabenKarte'
  | 'Keine';
/**
 * The transaction type arranges and divides all transactions into business transactions (document) and other transactions. This assignment also controls further processing in the cash closing. Only single transactions with the transaction type document are relevant for the cash closing. Invoices, delivery bills, corrections, etc. are displayed in the document. If single transactions are processed from other basic recording systems of the company, these single transactions must not have the transaction type document
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "transaction_type".
 */
export type TransactionType =
  | 'Beleg'
  | 'AVTransfer'
  | 'AVBestellung'
  | 'AVTraining'
  | 'AVBelegstorno'
  | 'AVBelegabbruch'
  | 'AVSachbezug'
  | 'AVSonstige'
  | 'AVRechnung';
/**
 * Country code according to ISO 3166 alpha-3
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "country_code".
 */
export type CountryCode =
  | 'ALA'
  | 'AFG'
  | 'ALB'
  | 'DZA'
  | 'ASM'
  | 'AND'
  | 'AGO'
  | 'AIA'
  | 'ATA'
  | 'ATG'
  | 'ARG'
  | 'ARM'
  | 'ABW'
  | 'AUS'
  | 'AUT'
  | 'AZE'
  | 'BHS'
  | 'BHR'
  | 'BGD'
  | 'BRB'
  | 'BLR'
  | 'BEL'
  | 'BLZ'
  | 'BEN'
  | 'BMU'
  | 'BTN'
  | 'BOL'
  | 'BIH'
  | 'BWA'
  | 'BVT'
  | 'BRA'
  | 'IOT'
  | 'BRN'
  | 'BGR'
  | 'BFA'
  | 'BDI'
  | 'KHM'
  | 'CMR'
  | 'CAN'
  | 'CPV'
  | 'CYM'
  | 'CAF'
  | 'TCD'
  | 'CHL'
  | 'CHN'
  | 'CXR'
  | 'CCK'
  | 'COL'
  | 'COM'
  | 'COD'
  | 'COG'
  | 'COK'
  | 'CRI'
  | 'CIV'
  | 'HRV'
  | 'CUB'
  | 'CYP'
  | 'CZE'
  | 'DNK'
  | 'DJI'
  | 'DMA'
  | 'DOM'
  | 'ECU'
  | 'EGY'
  | 'SLV'
  | 'GNQ'
  | 'ERI'
  | 'EST'
  | 'ETH'
  | 'FLK'
  | 'FRO'
  | 'FJI'
  | 'FIN'
  | 'FRA'
  | 'GUF'
  | 'PYF'
  | 'ATF'
  | 'GAB'
  | 'GMB'
  | 'GEO'
  | 'DEU'
  | 'GHA'
  | 'GIB'
  | 'GRC'
  | 'GRL'
  | 'GRD'
  | 'GLP'
  | 'GUM'
  | 'GTM'
  | 'GIN'
  | 'GNB'
  | 'GUY'
  | 'HTI'
  | 'HMD'
  | 'HND'
  | 'HKG'
  | 'HUN'
  | 'ISL'
  | 'IND'
  | 'IDN'
  | 'IRN'
  | 'IRQ'
  | 'IRL'
  | 'ISR'
  | 'ITA'
  | 'JAM'
  | 'JPN'
  | 'JOR'
  | 'KAZ'
  | 'KEN'
  | 'KIR'
  | 'PRK'
  | 'KOR'
  | 'KWT'
  | 'KGZ'
  | 'LAO'
  | 'LVA'
  | 'LBN'
  | 'LSO'
  | 'LBR'
  | 'LBY'
  | 'LIE'
  | 'LTU'
  | 'LUX'
  | 'MAC'
  | 'MKD'
  | 'MDG'
  | 'MWI'
  | 'MYS'
  | 'MDV'
  | 'MLI'
  | 'MLT'
  | 'MHL'
  | 'MTQ'
  | 'MRT'
  | 'MUS'
  | 'MYT'
  | 'MEX'
  | 'FSM'
  | 'MDA'
  | 'MCO'
  | 'MNG'
  | 'MSR'
  | 'MAR'
  | 'MOZ'
  | 'MMR'
  | 'NAM'
  | 'NRU'
  | 'NPL'
  | 'NLD'
  | 'ANT'
  | 'NCL'
  | 'NZL'
  | 'NIC'
  | 'NER'
  | 'NGA'
  | 'NIU'
  | 'NFK'
  | 'MNP'
  | 'NOR'
  | 'OMN'
  | 'PAK'
  | 'PLW'
  | 'PSE'
  | 'PAN'
  | 'PNG'
  | 'PRY'
  | 'PER'
  | 'PHL'
  | 'PCN'
  | 'POL'
  | 'PRT'
  | 'PRI'
  | 'QAT'
  | 'REU'
  | 'ROU'
  | 'RUS'
  | 'RWA'
  | 'SHN'
  | 'KNA'
  | 'LCA'
  | 'SPM'
  | 'VCT'
  | 'WSM'
  | 'SMR'
  | 'STP'
  | 'SAU'
  | 'SEN'
  | 'SCG'
  | 'SYC'
  | 'SLE'
  | 'SGP'
  | 'SVK'
  | 'SVN'
  | 'SLB'
  | 'SOM'
  | 'ZAF'
  | 'SGS'
  | 'ESP'
  | 'LKA'
  | 'SDN'
  | 'SUR'
  | 'SJM'
  | 'SWZ'
  | 'SWE'
  | 'CHE'
  | 'SYR'
  | 'TWN'
  | 'TJK'
  | 'TZA'
  | 'THA'
  | 'TLS'
  | 'TGO'
  | 'TKL'
  | 'TON'
  | 'TTO'
  | 'TUN'
  | 'TUR'
  | 'TKM'
  | 'TCA'
  | 'TUV'
  | 'UGA'
  | 'UKR'
  | 'ARE'
  | 'GBR'
  | 'USA'
  | 'UMI'
  | 'URY'
  | 'UZB'
  | 'VUT'
  | 'VAT'
  | 'VEN'
  | 'VNM'
  | 'VGB'
  | 'VIR'
  | 'WLF'
  | 'ESH'
  | 'YEM'
  | 'ZMB'
  | 'ZWE';
/**
 * VAT identification number
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_id_number".
 */
export type VatIdNumber = string;
/**
 * 'Reference' describes a reference to taxonomy transaction or a delivery bill or invoice from a third-party system.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "reference".
 */
export type Reference =
  | {
      type: 'ExterneRechnung' | 'ExternerLieferschein';
      date?: UnixTimestamp;
      external_export_id: string;
      [k: string]: unknown;
    }
  | {
      type: 'ExterneSonstige';
      /**
       * Name to specify the external reference in more detail
       */
      name: string;
      date?: UnixTimestamp;
      external_other_export_id: string;
      [k: string]: unknown;
    }
  | {
      type: 'Transaktion';
      date?: UnixTimestamp;
      cash_point_closing_export_id: number;
      cash_register_export_id: string;
      transaction_export_id: string;
      [k: string]: unknown;
    }
  | {
      type: 'InterneTransaktion';
      /**
       * UUID of the transaction to be linked.
       */
      tx_id: string;
      [k: string]: unknown;
    };
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_amounts_gross_and_net_receipt".
 */
export type VatAmountsGrossAndNetReceipt = VatAmountGrossAndNetReceipt[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "quantity".
 */
export type Quantity = number;
/**
 * The current state of the operation.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "operation_state".
 */
export type OperationState =
  | 'PENDING'
  | 'WORKING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DELETED'
  | 'ERROR';
/**
 * Specify the current official (company) name here.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "name".
 */
export type Name = string;
/**
 * Either the tax number (tax_number) or VAT number (vat_id_number) of the company must be specified (§ 14 para. 4 no. 2 UStG)
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tax_number".
 */
export type TaxNumber = string;
/**
 * Fixed sales tax references are assigned here. Tax rates 1-7 are fixed, 8-999 are reserved, and 1000-99999999 are available for free use.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_custom_export_id".
 */
export type VatDefinitionCustomExportId = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "percentage".
 */
export type Percentage = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_state_querystring".
 */
export type ExportStateQuerystring =
  | 'PENDING'
  | 'WORKING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DELETED'
  | 'ERROR';
/**
 * UUID of the sales tax definition
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_id".
 */
export type VatDefinitionId = string;
/**
 * Timestamp according to ISO 8601 and RFC3339 e.g. 2016-09-27T17:00:01+01:00 (Local time); this is the time when the cash closure was created.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "datetime".
 */
export type Datetime = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition".
 */
export type VatDefinition = {
  id?: number;
  [k: string]: unknown;
};

export type SignatureTimestampFormat =
  | 'unixTime'
  | 'utcTime'
  | 'utcTimeWithSeconds'
  | 'generalizedTime'
  | 'generalizedTimeWithMilliseconds';

export type TransactionDataEncoding = 'UTF-8' | 'ASCII';

export type SerialNumber = string;

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "api_key_authentication".
 */
export interface ApiKeyAuthentication {
  api_key: ApiKeyKey;
  api_secret: ApiKeySecret;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "refresh_token_authentication".
 */
export interface RefreshTokenAuthentication {
  refresh_token: RefreshToken;
}

/**
 * Successful authentication
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "authentication_response".
 */
export interface AuthenticationResponse {
  access_token: string;
  /**
   * Contains information about the claims that are embedded within the access token. Can be used to retrieve one's own `organization_id`.
   */
  access_token_claims: {
    env: Env;
    organization_id: OrganizationId;
    [k: string]: unknown;
  };
  access_token_expires_in: number;
  access_token_expires_at: UnixTimestamp;
  refresh_token: RefreshToken;
  refresh_token_expires_in: number;
  refresh_token_expires_at: UnixTimestamp;
}

/**
 * Status report
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "status_response".
 */
export interface StatusResponse {
  _success: boolean;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "organization_id_params".
 */
export interface OrganizationIdParams {
  organization_id: OrganizationId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "organization_and_user_id_params".
 */
export interface OrganizationAndUserIdParams {
  organization_id: OrganizationId;
  user_id: UserId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "organization_and_api_key_id_params".
 */
export interface OrganizationAndApiKeyIdParams {
  organization_id: OrganizationId;
  key_id: ApiKeyId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "client_id_params".
 */
export interface ClientIdParams {
  client_id: ClientId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "collection_querystring".
 */
export interface CollectionQuerystring {
  /**
   * Limits the number of returned results
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
}

/**
 *
 * You can use this parameter to attach custom key-value data to an object.
 * Metadata is useful for storing additional, structured information on an object.
 * Note: You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.
 *
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "metadata_request".
 */
export interface MetadataRequest {
  [k: string]: string;
}

/**
 * Returns metadata
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "metadata_response".
 */
export interface MetadataResponse {
  [k: string]: string;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "revision_param".
 */
export interface RevisionParam {
  revision?: Revision;
}

/**
 * Request Body Schema to either insert CashRegisters or Slaves.
 *
 *
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_register_request".
 */
export interface CashRegisterRequest {
  cash_register_type:
    | {
        type: 'MASTER';
        tss_id: TssId;
        [k: string]: unknown;
      }
    | {
        type: 'MASTER';
        serial_number: SerialNumber;
        signature_algorithm: string;
        signature_timestamp_format: SignatureTimestampFormat;
        transaction_data_encoding: TransactionDataEncoding;
        public_key: string;
        certificate: string;
        [k: string]: unknown;
      }
    | {
        type: 'SLAVE_WITHOUT_TSS';
        master_client_id: ClientId;
        [k: string]: unknown;
      }
    | {
        type: 'SLAVE_WITH_TSS';
        master_client_id: ClientId;
        tss_id: TssId;
        [k: string]: unknown;
      };
  /**
   * Identifies the brand of the cash register manufacturer.
   */
  brand: string;
  /**
   * Describes the model of the particular cash register.
   */
  model: string;
  software: {
    /**
     * The name of the respective cash register software is listed here.
     */
    brand?: string;
    /**
     * The version description of the respective software is given here.
     */
    version?: string;
    [k: string]: unknown;
  };
  base_currency_code: Currency;
  /**
   * Enabling this field indicates that this cash register cannot make a sales tax assignment at the time the receivable is closed. If this setting is to be changed, it is mandatory to create a cash closing first. Thus, the sales tax assignment is made at the time of delivery and service in any case.
   */
  processing_flags?: {
    UmsatzsteuerNichtErmittelbar?: boolean;
    [k: string]: unknown;
  };
  metadata?: Metadata;
  sign_api_version?: number;
}

/**
 * This parameter allows you to attach custom key value data to an object. Metadata is useful for storing additional, structured information about an object. *Note:* You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "metadata".
 */
export interface Metadata {
  [k: string]: string;
}

/**
 * Returns the cash register resource
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_register_response".
 */
export interface CashRegisterResponse {
  cash_register_type?: 'MASTER' | 'SLAVE_WITHOUT_TSS' | 'SLAVE_WITH_TSS';
  client_id?: ClientOrSlaveId;
  revision?: Revision;
  tss_id?: TssId;
  /**
   * Identifies the brand of the cash register manufacturer.
   */
  brand?: string;
  /**
   * Describes the model of the particular cash register.
   */
  model?: string;
  software?: {
    /**
     * The name of the respective cash register software is listed here.
     */
    brand?: string;
    /**
     * The version description of the respective software is given here.
     */
    version?: string;
    [k: string]: unknown;
  };
  base_currency_code?: Currency;
  /**
   * Enabling this field indicates that this cash register cannot make a sales tax assignment at the time the receivable is closed. If this setting is to be changed, it is mandatory to create a cash closing first. Thus, the sales tax assignment is made at the time of delivery and service in any case.
   */
  processing_flags?: {
    UmsatzsteuerNichtErmittelbar?: boolean;
    [k: string]: unknown;
  };
  master_client_id?: ClientId;
  metadata?: Metadata;
  time_creation?: UnixTimestamp;
  time_update?: UnixTimestamp;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * Returns the cash register list
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_registers_response".
 */
export interface CashRegistersResponse {
  data?: CashRegisterResponse[];
  count?: Count;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "closing_id_params".
 */
export interface ClosingIdParams {
  closing_id: ClosingId;
}

/**
 * The cash closing is created once, multiple times, or across calendar days for a cash register.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closing_insert".
 */
export interface CashPointClosingInsert {
  /**
   * This bracket displays the central master data of the cash closing.
   */
  head: {
    /**
     * The optional posting date of the cash closing, e.g. for posting to financial accounting. The posting date must be specified if it is different from the creation date. It is specified according to ISO 8601 and RFC3339 in the format 'YYYY-MM-DD'.
     */
    business_date?: string;
    /**
     * The id of the first transaction that flows into a cash point closing.
     */
    first_transaction_export_id: string | null;
    /**
     * The Id of the last transaction that flows into a cash closure.
     */
    last_transaction_export_id: string | null;
    export_creation_date: UnixTimestamp;
    [k: string]: unknown;
  };
  cash_statement: CashStatement;
  /**
   * Forms the bracket around all individual transactions of a cash point closing.
   */
  transactions: Transaction[];
  client_id: ClientId;
  /**
   * Each cash register assigns the cash closing number. This is ascending, consecutive, non-resettable. It must not be repeated within a cash register. Adding the cash_register/id makes the cash closure unique.
   */
  cash_point_closing_export_id: number;
  metadata?: Metadata;
  sign_api_version?: number;
}

/**
 * All transactions of a cash register are represented in the CashStatement. The cash statement of a cash register represents the business transactions in one block and the cash flows in a second block.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_statement".
 */
export interface CashStatement {
  business_cases: BusinessCase[];
  /**
   * The payment type forms the second block of the CashStatement and breaks down the total payment flow at a cash point into different payment types.
   */
  payment: {
    full_amount: Amount;
    cash_amount: Amount;
    /**
     * A breakdown of all cash receipts by currency.
     */
    cash_amounts_by_currency: CashAmountByCurrency[];
    payment_types: PaymentTypeItem[];
    [k: string]: unknown;
  };
}

/**
 * The business_case qualifies the business transaction in the single movement and in the cash closure in terms of subject matter and content.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "business_case".
 */
export interface BusinessCase {
  type: BusinessCaseType;
  /**
   * The name subdivides the business_case more deeply in terms of subject and content. No, one or more names can be assigned to a business_case.
   */
  name?: string;
  purchaser_agency_id?: PurchaserAgencyId;
  amounts_per_vat_id: VatAmountsGrossAndNet;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_amount_gross_and_net".
 */
export interface VatAmountGrossAndNet {
  incl_vat: number;
  excl_vat: number;
  vat: number;
  vat_definition_export_id: VatDefinitionExportId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_amount_by_currency".
 */
export interface CashAmountByCurrency {
  currency_code: Currency;
  amount: Amount;
}

/**
 * Subdivision of paid amounts by payment type and currency.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "payment_type_item".
 */
export interface PaymentTypeItem {
  type: PaymentType;
  name?: string;
  currency_code: Currency;
  foreign_amount?: Amount;
  amount: Amount;
}

/**
 * Forms the bracket around a single individual transaction. So is the single document or single receipt. Also the transaction breaks down into header and transaction data.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "transaction".
 */
export interface Transaction {
  /**
   * The transaction header contains all the master data for the single transaction.
   */
  head: {
    type: TransactionType;
    /**
     * Optional name of the transaction (mandatory for transaction type AVOther!)
     */
    name?: string;
    /**
     * Indicates a global reversal operation at document level.
     */
    storno: boolean;
    /**
     * The receipt number is to be kept consecutive in the cash closure. However, it may be repeated during the life cycle of a cash point.
     */
    number: number;
    timestamp_start: UnixTimestamp;
    timestamp_end: UnixTimestamp;
    /**
     * The user is the person officially responsible for accounting for the single transaction at the cash register. (Ex: Operator records or receipts, User cashes)
     */
    user: {
      /**
       * The user's name is stored in the cash register system.
       */
      name?: string;
      /**
       * The user has an internal company identifier.
       */
      user_export_id: string;
      [k: string]: unknown;
    };
    /**
     * Forms the bracket around all data about a buyer. Background: From an invoice amount of 200,00€ the so called small amount limit of an invoice is exceeded. Then the buyer's address must be entered. For this purpose, the fields below the bracket [buyer] are used. There is also a name and the corresponding address here.
     */
    buyer: {
      /**
       * The name of the buyer.
       */
      name: string;
      type: 'Kunde' | 'Mitarbeiter';
      address?: AddressOptional;
      vat_id_number?: VatIdNumber;
      /**
       * The customer number of the buyer.
       */
      buyer_export_id: string;
      [k: string]: unknown;
    };
    /**
     * References to external delivery bills, invoices, or transactions of a taxonomy cash closing.
     */
    references?: [Reference, ...Reference[]];
    allocation_groups?: string[];
    /**
     * UUID of a transaction. This ID should match the TX ID in the TSE API. If there is no corresponding entry in the TSE API, it is user-definable.
     */
    tx_id: string;
    /**
     * Id of the transaction assigned automatically and invariably by the cash system. The Id must be unique within a cash point closing.
     */
    transaction_export_id: string;
    /**
     * The client ID of the master cash register or slave cash register (terminal) where the transaction was performed.
     */
    closing_client_id: string;
    [k: string]: unknown;
  };
  /**
   * Forms the parenthesis around all transaction data of a single receipt. TransactionData distinguish the data into total amount with breakdown into payment types and sales tax issues, additional notes, receipt items with item or merchandise category reference, and receipt items without item or merchandise category reference.
   */
  data: {
    full_amount_incl_vat: Amount;
    payment_types: PaymentTypeItem[];
    amounts_per_vat_id: VatAmountsGrossAndNetReceipt;
    /**
     * Appropriate additional notes are recorded under [notes].
     */
    notes?: string;
    /**
     * Each receipt that defines a transaction at the cash register is called a transaction. A transaction can consist of one or more business transactions. These business transactions are called [lines] in the following. The taxonomy distinguishes between ItemLine and TypeLine. The ItemLine stands for business transactions that have a reference to an item, product or merchandise category.
     */
    lines: LineItem[];
    [k: string]: unknown;
  };
  /**
   * To meet the security requirements, it is necessary to pass the link to a TSE transaction or, if there is no corresponding\n TSE transaction, an error message.
   */
  security:
    | {
        /**
         * Identifies a transaction in the Sign API by a \`tx_uuid\` (i.e., a self-generated UUIDv4).
         */
        tss_tx_id: string;
        [k: string]: unknown;
      }
    | {
        /**
         * In case of TSE failure or error, a meaningful error description should be entered here.
         */
        error_message: string;
        [k: string]: unknown;
      }
    | {
        /**
         * In case of external TSS is used.
         */
        tx_number: string;
        tx_start: string;
        tx_end: string;
        process_type: 'Kassenbeleg-V1' | 'Bestellung-V1' | 'SonstigerVorgang';
        process_data: string;
        signature_counter: string;
        signature: string;
        error_message: string;
        [k: string]: unknown;
      };
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "address_optional".
 */
export interface AddressOptional {
  street?: string;
  postal_code?: string;
  city?: string;
  country_code?: CountryCode;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_amount_gross_and_net_receipt".
 */
export interface VatAmountGrossAndNetReceipt {
  incl_vat: number;
  excl_vat: number;
  vat: number;
  vat_definition_export_id: VatDefinitionExportId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "line_item".
 */
export interface LineItem {
  business_case: BusinessCaseLine;
  /**
   * Indicates an in_house sale or out of house sale.
   */
  in_house?: boolean;
  /**
   * Indicates a line-level cancellation operation.
   */
  storno: boolean;
  /**
   * References to external delivery bills, invoices, or transactions of a taxonomy cash closing.
   */
  references?: [Reference, ...Reference[]];
  voucher_id?: string;
  /**
   * Description of the line or name of the item.
   */
  text: string;
  /**
   * Within the transaction, the item forms the parenthesis around all item-specific information.
   */
  item: {
    /**
     * Identifies a unique number used to maintain and manage the item, product, or merchandise category in the company's systems.
     */
    number: string;
    /**
     * The Global Trade Item Number (GTIN) is an international, unique number used to identify products. It is managed and assigned worldwide by GS1. The formerly common designation European Article Number (EAN) was replaced by the GTIN in 2009.
     */
    gtin?: string;
    quantity: Quantity;
    quantity_factor?: number;
    /**
     * Measure denotes the unit of measure. If the unit of measure field is empty, the unit of piece automatically applies.
     */
    quantity_measure?: string;
    /**
     * Unique ID of the merchandise group, for example, the merchandise group number.
     */
    group_id?: string;
    /**
     * Describes the name of the merchandise group.
     */
    group_name?: string;
    /**
     * PricePerUnit is the item base price for quantity quantity_factor of the unit of measure specified by quantity_measure.
     */
    price_per_unit: number;
    base_amounts_per_vat_id?: VatAmountsGrossAndNet;
    discounts_per_vat_id?: VatAmountsGrossAndNet;
    extra_amounts_per_vat_id?: VatAmountsGrossAndNet;
    /**
     * The SubItems create the possibility to explain the composition of sold products or merchandise group descriptions on item level. Example: menuI = cola and hamburger. The SubItems do not have to be filled. They have explanatory character and no expressiveness regarding price and sales tax.
     */
    sub_items?: [SublineItem, ...SublineItem[]];
    [k: string]: unknown;
  };
  lineitem_export_id: string;
}

/**
 * The business_case of a line can only be either gross or net.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "business_case_line".
 */
export interface BusinessCaseLine {
  type: BusinessCaseType;
  /**
   * The name subdivides the business_case more deeply in terms of subject and content. No, one or more names can be assigned to a business_case.
   */
  name?: string;
  purchaser_agency_id?: PurchaserAgencyId;
  amounts_per_vat_id: VatAmountsGrossAndNet;

  [k: string]: unknown;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "subline_item".
 */
export interface SublineItem {
  number: string;
  gtin?: string;
  name?: string;
  quantity: Quantity;
  quantity_factor?: number;
  /**
   * Measure denotes the unit of measure. If the unit of measure field is empty, the unit of piece automatically applies.
   */
  quantity_measure?: string;
  /**
   * Unique ID of the merchandise group, for example, the merchandise group number.
   */
  group_id?: string;
  group_name?: string;
  amount_per_vat_id: VatAmountGrossAndNet;
}

/**
 * If the state property is equal to `ERROR`, then the error is described by this property.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "error_response".
 */
export interface ErrorResponse {
  /**
   * Error code
   */
  code?: string;
  /**
   * Error message
   */
  message?: string;
}

/**
 * Returns the cash point closing resource
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closing_response".
 */
export interface CashPointClosingResponse {
  cash_point_closing?: CashPointClosing;
  state?: OperationState;
  error?: ErrorResponse;
  time_creation?: UnixTimestamp;
  time_update?: UnixTimestamp;
  time_deleted?: UnixTimestamp;
  metadata?: Metadata;
  sign_api_version?: SignApiVersionType;
  _id?: ClosingId;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * The cash closing is created once, multiple times, or across calendar days for a cash register.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closing".
 */
export interface CashPointClosing {
  /**
   * This bracket displays the central master data of the cash closing.
   */
  head: {
    /**
     * The optional posting date of the cash closing, e.g. for posting to financial accounting. The posting date must be specified if it is different from the creation date. It is specified according to ISO 8601 and RFC3339 in the format 'YYYY-MM-DD'.
     */
    business_date?: string;
    /**
     * The id of the first transaction that flows into a cash point closing.
     */
    first_transaction_export_id: string | null;
    /**
     * The Id of the last transaction that flows into a cash closure.
     */
    last_transaction_export_id: string | null;
    export_creation_date: UnixTimestamp;
    [k: string]: unknown;
  };
  cash_statement: CashStatement;
  /**
   * Forms the bracket around all individual transactions of a cash point closing.
   */
  transactions: Transaction[];
  client_id: ClientId;
  metadata?: Metadata;
  /**
   * Each cash register assigns the cash closing number. This is ascending, consecutive, non-resettable. It must not be repeated within a cash register. Adding the cash_register/id makes the cash closure unique.
   */
  cash_point_closing_export_id: number;
}

/**
 * Returns the cash point closing resource
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closings_item_response".
 */
export interface CashPointClosingsItemResponse {
  closing_id?: ClosingId;
  /**
   * Each cash register assigns the cash balance number. This number is ascending, consecutive and cannot be reset. It may not be repeated within a cash register. The addition of the cash_register/id makes the cash statement unique.
   */
  cash_point_closing_export_id?: number;
  state?: OperationState;
  error?: ErrorResponse;
  client_id?: ClientId;
  /**
   * The optional posting date of the cash closing, e.g. for posting to financial accounting. The posting date must be specified if it is different from the creation date. It is specified according to ISO 8601 and RFC3339 in the format 'YYYY-MM-DD'.
   */
  business_date?: string;
  /**
   * The id of the first transaction that flows into a cash point closing.
   */
  first_transaction_export_id?: string | null;
  /**
   * The Id of the last transaction that flows into a cash closure.
   */
  last_transaction_export_id?: string | null;
  export_creation_date?: UnixTimestamp;
  full_amount?: Amount;
  cash_amount?: Amount;
  metadata?: Metadata;
  sign_api_version?: SignApiVersionType;
  time_creation?: UnixTimestamp;
  time_update?: UnixTimestamp;
  time_deleted?: UnixTimestamp;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * Returns all cash point closings resource
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closings_response".
 */
export interface CashPointClosingsResponse {
  data?: CashPointClosingsItemResponse[];
  count?: Count;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency_params".
 */
export interface PurchaserAgencyParams {
  purchaser_agency_id: PurchaserAgencyId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency_request".
 */
export interface PurchaserAgencyRequest {
  name: Name;
  address: AddressStrict;
  tax_number: TaxNumber;
  vat_id_number?: VatIdNumber;
  /**
   * Referencing all agency purchaser data for agency sales to an ID is done at this location. Numbers 1 - 9999999999 are accepted for the ID. Only whole numbers are accepted. The order must be ascending in increments of 1.
   */
  purchaser_agency_export_id: number;
  client_id: ClientId;
  metadata?: Metadata;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "address_strict".
 */
export interface AddressStrict {
  street: string;
  postal_code: string;
  city: string;
  country_code: CountryCode;
}

/**
 * Returns information about an existing purchaser agency.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency_response".
 */
export interface PurchaserAgencyResponse {
  purchaser_agency_id?: PurchaserAgencyId;
  revision?: Revision;
  name?: Name;
  address?: AddressStrict;
  tax_number?: TaxNumber;
  vat_id_number?: VatIdNumber;
  /**
   * Referencing all agency purchaser data for agency sales to an ID is done at this location. Numbers 1 - 9999999999 are accepted for the ID. Only whole numbers are accepted. The order must be ascending in increments of 1.
   */
  purchaser_agency_export_id?: number;
  client_id?: ClientId;
  metadata?: Metadata;
  time_creation?: UnixTimestamp;
  time_update?: UnixTimestamp;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * List all purchaser agencies
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agencies_response".
 */
export interface PurchaserAgenciesResponse {
  data?: PurchaserAgencyResponse[];
  count?: Count;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_params".
 */
export interface VatDefinitionParams {
  vat_definition_export_id: VatDefinitionExportId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_custom_params".
 */
export interface VatDefinitionCustomParams {
  vat_definition_export_id: VatDefinitionCustomExportId;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_request".
 */
export interface VatDefinitionRequest {
  percentage: Percentage;
  description?: string;
  metadata?: MetadataRequest;
}

/**
 * Returns information about an existing vat definition.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definition_response".
 */
export interface VatDefinitionResponse {
  vat_definition_export_id?: VatDefinitionExportId;
  percentage?: Percentage;
  description?: string;
  metadata?: Metadata;
  revision?: Revision;
  time_creation?: UnixTimestamp;
  time_update?: UnixTimestamp;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * List all vat definitions
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definitions_response".
 */
export interface VatDefinitionsResponse {
  data?: VatDefinitionResponse[];
  count?: Count;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vat_definitions_collection_querystring".
 */
export interface VatDefinitionsCollectionQuerystring {
  order_by?:
    | 'vat_definition_export_id'
    | 'time_creation'
    | 'time_update'
    | 'percentage';
  /**
   * Specifies the property to sort by
   */
  order?: 'asc' | 'desc';
  /**
   * Determines the sorting orders
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
}

/**
 * Returns the export resource
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_response".
 */
export interface ExportResponse {
  state: OperationState;
  error?: ErrorResponse;
  /**
   * Time of the initial request.
   */
  time_request: number;
  /**
   * Time of the start of the export operation.
   */
  time_start?: number;
  /**
   * Time of the completion of the export operation.
   */
  time_completed?: number;
  /**
   * Time of the expiration of the generated TAR file.
   */
  time_expiration?: number;
  /**
   * Time of the error.
   */
  time_error?: number;
  cash_point_closings?: string[];
  metadata?: MetadataRequest;
  sign_api_version: SignApiVersionType;
  _type?: string;
  /**
   * Identifies an Export
   */
  _id?: string;
  _env?: Env;
  _version?: Version;
  sign_api_version: SignApiVersionType;
}

/**
 * Returns the Export list
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_list_response".
 */
export interface ExportListResponse {
  data?: ExportResponse[];
  count?: Count;
  _type?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * Returns the download url of an export
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_download_url_response".
 */
export interface ExportDownloadUrlResponse {
  href?: string;
  _env?: Env;
  _version?: Version;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_collection_querystring".
 */
export interface ExportCollectionQuerystring {
  order_by?: ExportOrderBy;
  /**
   * Specifies the property to sort by
   */
  order?: 'asc' | 'desc';
  /**
   * Limits the number of returned results
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
  /**
   * Either `states=PENDING` or `states=PENDING&states=WORKING`
   */
  states?: ExportStateQuerystring[] | ExportStateQuerystring;
  client_id?: ClientId;
  cash_point_closing_id?: ClosingId;
  business_date_start?: string;
  business_date_end?: string;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_register_collection_querystring".
 */
export interface CashRegisterCollectionQuerystring {
  order_by?: 'cash_register_type' | 'time_creation' | 'time_update';
  /**
   * Specifies the property to sort by
   */
  order?: 'asc' | 'desc';
  /**
   * Determines the sorting orders
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency_collection_querystring".
 */
export interface PurchaserAgencyCollectionQuerystring {
  client_id?: ClientId;
  order_by?:
    | 'name'
    | 'time_creation'
    | 'time_update'
    | 'purchaser_agency_export_id';
  /**
   * Specifies the property to sort by
   */
  order?: 'asc' | 'desc';
  /**
   * Limits the number of returned results
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_params".
 */
export interface ExportParams {
  /**
   * Identifies an Export
   */
  export_id: string;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "export_trigger_request".
 */
export interface ExportTriggerRequest {
  /**
   * Only export cash point closings with `time_creation` larger than or equal to the given start date.
   */
  start_date: number;
  /**
   * Only export cash point closings with `time_creation` smaller than or equal to the given end date.
   */
  end_date: number;
  client_id?: ClientId;
  metadata?: MetadataRequest;
  sign_api_version?: SignApiVersionType;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_point_closing_collection_querystring".
 */
export interface CashPointClosingCollectionQuerystring {
  client_id?: ClientId;
  start_date?: UnixTimestamp;
  end_date?: UnixTimestamp;
  business_date_start?: string;
  business_date_end?: string;
  /**
   * Either `states=PENDING` or `states=PENDING&states=WORKING`
   */
  states?: ExportStateQuerystring[] | ExportStateQuerystring;
  /**
   * Specifies the property to sort by
   */
  order_by?: 'time_creation' | 'state' | 'business_date';
  /**
   * Determines the sorting orders
   */
  order?: 'asc' | 'desc';
  /**
   * Limits the number of returned results
   */
  limit?: number;
  /**
   * Skips the specified number of results from the result set
   */
  offset?: number;
}

/**
 * The parenthesis around all the details of the particular cash point.
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "cash_register".
 */
export interface CashRegister {
  /**
   * Identifies the brand of the cash register manufacturer.
   */
  brand: string;
  /**
   * Describes the model of the particular cash register.
   */
  model: string;
  software: {
    /**
     * The name of the respective cash register software is listed here.
     */
    brand?: string;
    /**
     * The version description of the respective software is given here.
     */
    version?: string;
    [k: string]: unknown;
  };
  base_currency_code: Currency;
  /**
   * Enabling this field indicates that this cash register cannot make a sales tax assignment at the time the receivable is closed. If this setting is to be changed, it is mandatory to create a cash closing first. Thus, the sales tax assignment is made at the time of delivery and service in any case.
   */
  processing_flags?: {
    UmsatzsteuerNichtErmittelbar?: boolean;
    [k: string]: unknown;
  };
  client_id: ClientOrSlaveId;
  master_client_id?: ClientId;
  tss_id: TssId;
  metadata?: Metadata;
}

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "purchaser_agency".
 */
export interface PurchaserAgency {
  name: Name;
  address: AddressStrict;
  tax_number: TaxNumber;
  vat_id_number?: VatIdNumber;
  purchaser_agency_id: PurchaserAgencyId;
  sign_api_version?: number;
  /**
   * Referencing all agency purchaser data for agency sales to an ID is done at this location. Numbers 1 - 9999999999 are accepted for the ID. Only whole numbers are accepted. The order must be ascending in increments of 1.
   */
  purchaser_agency_export_id: number;
  client_id: ClientId;
  metadata?: Metadata;
}
