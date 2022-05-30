import pkg from '../../../package.json';
import stripIndent from 'strip-indent';
import {
  CashPointClosingType,
  CashRegisterType,
  CashStatementType,
  ClientIdType,
  MetadataType,
  PurchaserAgencyIdType,
  PurchaserAgencyType,
  SignApiVersionType,
  TssIdType,
  UnixTimestampType,
  VatDefinitionExportIdType,
  VatDefinitionType,
  SerialNumberType,
  SignatureAlgorithmType,
  SignatureTimestampFormatType,
  TransactionDataEncodingType,
  PublicKeyType,
  CertificateType,
} from './generated-types';

//
// Constants
//

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

// eslint-disable-next-line
const statusCodes = require('http').STATUS_CODES;

const version = pkg.version;
export const majorVersion = version.split('.')[0];
const basePath = '/api/v' + majorVersion;
export const legacyBasePath = majorVersion === '1' ? '/api/v0' : null;
const $id = `urn:com.fiskaly.dsfinvk:dsfinvk-api:${version}`;
const title = pkg.description;
const isProduction = /production/i.test(process.env.NODE_ENV);

// TODO: Once we have a better picture of what needs to be adapted,
//       We should add these links back.
// German: [DSFinV-K 2.3](${
//         isProduction
//           ? 'https://dsfinvk.fiskaly.com/api/v1/_docs'
//           : '/api/v1/_docs'
//       }/dsfinvk/dsfinv_k_v_2_3.zip)
// English: [DSFinV-K 2.3](${
//         isProduction
//           ? 'https://dsfinvk.fiskaly.com/api/v1/_docs'
//           : '/api/v1/_docs'
//       }/dsfinvk/dsfinv_k_v_2_3_eng_version.pdf) (Disclaimer: the translation is not legally binding.)

export default {
  $id,
  info: {
    title,
    description: stripIndent(`
      Imprint: [fiskaly.com/impressum](https://fiskaly.com/impressum) | Privacy Policy: [fiskaly.com/datenschutz](https://fiskaly.com/datenschutz)

      Further information on the DSFinV-K can be found on the [German Federal Central Tax Office website](https://www.bzst.de/DE/Unternehmen/Aussenpruefungen/DigitaleSchnittstelleFinV/digitaleschnittstellefinv_node.html#js-toc-entry2).

      # Introduction

      The ${title} is a RESTful API that takes a cash point closing and stores data to be later exported according to the
      DSFinV-K. The payload expected by the API closely resembles the DFKA Taxonomy 2.1.1, but links the data with entries from 
      the KassenSichV and Management API.

      * Base URL: [https://dsfinvk.fiskaly.com/api/v1](https://dsfinvk.fiskaly.com/api/v1)${
        majorVersion === '1'
          ? '\n' +
            '      * Legacy Base URL: [https://dsfinvk.fiskaly.com/api/v0](https://dsfinvk.fiskaly.com/api/v0)  \n' +
            '        **Note that v1 and v0 are fully compatible.**'
          : ''
      }

      Usage of the API Endpoints:
      - Masterdata such as VAT Definitions, Cash Registers and Purchaser Agencies should be submitted once whenever they change in the setup
      - The Cash Point Closing endpoint should be called with each cash point closing ("Kassenabschluss"). 
      - Exports can be triggered at any time

      ## Versioning

      Our API follows [Semantic Versioning](https://semver.org).

      That means, given a version number \`MAJOR.MINOR.PATCH\`, we increment the:
      - \`MAJOR\` version when we make incompatible API changes,
      - \`MINOR\` version when we add functionality in a backwards-compatible manner, and
      - \`PATCH\` version when we make backwards-compatible bug fixes.

      The current \`MAJOR\` version \`${majorVersion}\` is reflected in the APIs base URL: \`${basePath}\`.

      ## Changelog
      - \`1.4.0\` (2022-05-20):
        - Making it possible to use non-fiskaly TSS with fiskaly DSFinV-K.  
          We recommend to export Cash Point Closings separately for each
          client_id for now when using non-fiskaly TSS.
        - Added new historic VAT definitions.
        - Added missing \`TSE_ZERTIFIKAT_V\` to \`tse.csv\`.
        - Fixed a problem when using historic vat definitions.
        - Fixed an error when sending larger \`quantity_factor\`.
        - Fixed query parameters for \`listCashPointClosings\`.
        - Fixed problem when \`vat_definition_export_id\` is being reused in
          another environment.
      - \`1.3.0\` (2022-04-13):
        - Fixed missing error messages for Cash Point Closings
        - Fixed triggering exports with Cash Point Closings that were created before 2021-12-24.  
          **Note:** Old exports in the TEST environments might get removed in the future. Please trigger a new export
          with the old Cash Point Closings in the TEST environment.
        - Fixed spelling.
      - \`1.2.0\` (2022-02-24):
        - Added \`order_by\` and \`order\` query parameters to the [List all vat definitions](#operation/listVatDefinitions) endpoint.
        - Fixed a problem with Cash Point Closings that contained transactions that were not signed by the SIGN API.
        - Fixed number validation for big numbers.
      - \`1.1.1\` (2022-02-21):
        - Fixed a problem with creating exports of cash point closings with a specific client_id.
      - \`1.1.0\` (2022-02-17):
        - Increased performance of insertCashPointClosing.
        - Added possibility to filter results of listExports by business date.
        - Making transaction IDs case-insensitive for cash point closings.
        - Fixed duplicate API specs.
        - Fixed duplicate Cash Point Closings on the listCashPointClosings endpoint.
        - Fixed a problem when using multiple cash registers with multiple revisions.
        - Fixed a bug in the exported lines.csv.
      - \`1.0.0\` (2022-02-02):
        - Improved performance of exports.  
          **Update 2022-04-13:** Exports that contain old Cash Point Closings created before 2021-12-24 can now be
          triggered.  
          We currently process older exports that were created before 2021-12-24.
          **Previous note:** Cash Point Closings that were created before 2021-12-24 and would be
          included in an export will be postponed as that data is currently being migrated.  
          **We update this Changelog once older data was migrated.**
        - Multiple bugfixes on various CSV files.
        - Fixed documented response types of list endpoints.
      - \`0.14.0\` (2021-12-06):
        - Improved description for exports and added a new \`cash_point_closings\` field in the response to show which are included.
        - Improved performance of [Retrieve details of a cash point closing](#operation/retrieveCashPointClosingDetails).
        - Added \`order_by\` and \`order\` for [List all purchaser agencies](#operation/listPurchaserAgencies) endpoint.
        - Fixed multiple exported field values.
        - Fixed endpoints for retrieving metadata when no metadata is available.
      - \`0.13.0\` (2021-10-28):
        - Improved response times of [Trigger an Export](#operation/triggerExport). We are currently working hard on improving our overall performance and keep investigating our endpoints.
        - Added \`order_by\` and \`order\` options for [List all exports](#operation/listExports) and [List all cash point closings](#operation/listCashPointClosings).
        - Fixed creating Cash Point Closings with custom VAT definitions.
      - \`0.12.0\` (2021-10-12):
        - Added new endpoint that allows to [delete Cash Point Closings](#operation/deleteCashPointClosing).
        - Fixed \`time_creation\` field to only show the actual creation timestamp of when a Cash Register was created.
      - \`0.11.1\` (2021-10-04):
        - Fixed Cash Registers that were created between 2021-08-11 and 2021-09-27. They can be used to create
          Cash Point Closings again. The old Cash Point Closings that ran into an \`ERROR\` need to be retriggered
          with a new \`closing_id\`.
      - \`0.11.0\` (2021-09-30):
        - Making \`sign_api_version\` obsolete in the request body. The field will be ignored if it is being used.
        - Marking \`sign_api_version\` as deprecated in the response.
        - **Known issues**
          - Cash Registers and Cash Point Closing which were created between 2021-08-11 and 2021-09-27 are currently not
            working. It will be fixed in the next couple of days.
          - Triggering Exports including Cash Point Closings with Cash Registers from multiple sign API versions will
            only export the sign API version 2. A possible workaroung is to export Cash Registers from sign API v1 one
            by one. It will be fixed in a future version.
      - \`0.10.0\` (2021-09-27):
        - Extend API with \`sign_api_version\` fields to allow for a better integration with sign API v2.
        - Added \`order_by\` and \`order\` options for [List all cash registers](#operation/listCashRegisters).
        - Fixed exports with sign API v2 entities.
        - Fixed creation of vat definitions with numbers in the specified range.
        - Fixed error code when triggering export with an already existing UUID.
        - Fixed missing csv files (\`references.csv\`, \`allocation_groups.csv\`, \`datapayment.csv\`).
        - **Known issues**
          - \`tse.csv\` might be missing in exports for \`sign_api_version=2\`.
      - \`0.9.0\` (2021-08-11):
        - Added Support for fiskaly sign API v2 for most enpoints.
        - Changed validation of \`country_code\` and \`currency\` definition.
        - Fixed multiple issues with exported CSV files.
      - \`0.8.0\` (2021-06-25):
        - Fixed TSE_SERIAL field in tse.csv.
        - Fixed UST_SCHLUESSEL field in business_cases.csv.
        - Fixed inserting Cash Point Closing with coupons.
        - Fixed count field on responses of list endpoints.
        - Performance improvements.
      - \`0.7.0\` (2021-05-20):
        - Translated documentation into English.
        - Fixed missing \`businesscases.csv\` in exports.
        - Fixed missing \`itemamounts.csv\` in exports.
        - Fixed missing \`subitems.csv\` in exports.
        - Fixed order of CSV columns in multiple exported files.
        - Fixed the use of historic vat definitions ("Historische Steuersätze") in a Cash Point Closing.
        - Fixed inconsistent revisions for Cash Registries.
        - Fixed response of \`upsertCashRegister\` to include the \`processing_flag\` and \`software\` field.
        - Wording improvements in the documentation.
      - \`0.6.1\` (2021-03-26):
        - Fixed \`export_creation_date\` response format on [List all cash point closings](#operation/listCashPointClosings) endpoint. 
      - \`0.6.0\` (2021-03-19):
        - Added linked dtd file to export.
        - Better error handling on invalid time formats.
        - Fixed *MAX_PARAMETERS_EXCEEDED* error for Cash Point Closings.
        - Fixed misleading *E_CLIENT_NOT_FOUND* error for Cash Point Closings.
        - Fixed input of \`incl_vat\`, \`excl_vat\` and \`vat\` and allowing up to 5 decimal places.
      - \`0.5.1-alpha\` (2021-03-03):
        - Fixed Cash Point Closing requests that contains either an empty transaction list or only transactions that  
          have the \`security.error_message\` set.
        - Fixed the \`client_id\` filter in [listExports](#operation/listExports).
      - \`0.5.0-alpha\` (2020-09-07):
        - Marked multiple required fields
        - Better error handling
      - \`0.4.0-draft\`:
        - Cash Point Closing and Export implemented
        - Change Cash Point Closing retrieve response to match the insert response. This drastically reduces the response time.
        - Expose new Cash Point Closing details endpoint to be able to retrieve the whole Cash Point Closing.
        - Error response properties do now include the error code and message.
      - \`0.3.0-draft\`:
        - Cash Point Closing insert endpoint is now asyncronous.
        - Use Vat Definition Export ID as key in schema.
      - \`0.2.0-draft\`:
        - Schema adopted to include all required fields for export
        - Implements now DFKA taxonomy 2.1.1
        - All date-time fields are now unix timestamps
      - \`0.1.0-draft\`:
        - Initial API draft.

      ## Errors and Status Codes

      Our API uses standard [HTTP status codes](https://http.cat/) to indicate the success or failure of requests:

      ### Status \`2xx\`

      Status codes in the \`200-299\` range indicate success.

      ### Status \`4xx\`

      Status codes in the \`400-499\` range indicate errors that have been caused by the client (e.g., a malformed request body has been sent).  
      Retrying such requests with the same request body is pointless and *will* result in the same status code again.
      Some \`4xx\` errors can be handled programmatically may therefore include an additional error \`code\` like the following example:

      \`\`\`
      {
        "status_code": 400,
        "error": "Bad Request",
        "code": "E_SOME_ERROR",
        "message": "Something bad happened"
      }
      \`\`\`

      ### Status \`5xx\`

      Status codes in the \`500-599\` range indicate errors on our side.
      Errors on our side can be considered temporary.
      This means that you may **safely retry** (see [Idempotent Requests](#section/Introduction/Idempotent-Requests)) the same request after a certain delay.
      We recommend an [exponential backoff](https://wikipedia.org/wiki/Exponential_backoff) in your retry logic.
      Otherwise you might risk running into a [\`429 (Too Many Requests)\`](https://http.cat/429) error.

      ## Request IDs

      For each request, our API associates a unique request identifier to it.
      You will find this request identifier in the response headers, under \`X-Request-ID\`.
      If you need to contact us about a specific request (e.g. for debugging porposes) you have issued, please be sure to include the request identifier as this will greatly facilitate resolution on both sides.

      ## Metadata

      Another concept of our API is custom, user-defined metadata.
      Most resources in our API (e.g. [Cash Register](#tag/Cash-Register)) include a \`metadata\` property, that can be used to attach and store additional, structured information suchs resources.

      For example, you could store a unique identifier for a particular cash register from your system on Cash Register object.

      Note: You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.

      ## Revisions

      For the defined master data resources, [VAT Definition](#tag/VAT-Definition), [Purchaser Agency](#tag/Purchaser-Agency), 
      [Cash Register](#tag/Cash-Register), we provide a revision mechanic, to ensure historical data integrity. On every update 
      (except metadata updates) of a given resource, we automatically create a new revision. This means, that the state of all master 
      data resources on a future data export, is always equal to the state of the resource at the exact time of the insert of a cash 
      point closing.

      Note: You can retrieve a specific revision of a resource by providing the "revision" query param on the "Retrieve" methods.

      ## IDs and Export IDs

      All data in this API is referenced and uniquely identified by UUIDs. In the schema those are named "id". 
      The IDs that are passed in from the source system (cash register) are named "export_id". Those IDs are not used
      for referencing, but ensure compliancy with DSFinV-K on the export side. 

      **Make sure that your \`client_id\` is unique throughout all systems when using multiple sign API versions!**  
      You can re-use the serial number but need to assign a new UUID.

      # Quick Start

      For a quick first demo, you may use [Postman](https://www.getpostman.com/). We prepared a [Postman collection](https://www.getpostman.com/collection) that allows you to step through the most important functions of this API.
    
      1. First of all, download the [Postman](https://www.getpostman.com/downloads/) application.
    
      2. Create an API key and API secret via the [fiskaly dashboard](https://dashboard.fiskaly.com) (necessary for step 6).
    
      3. Download the [Postman collection](${
        isProduction
          ? 'https://dsfinvk.fiskaly.com/api/v1/_docs'
          : '/api/v1/_docs'
      }/postman/fiskaly.dsfinv-k.postman_collection.json) and the [Postman environment](${
      isProduction
        ? 'https://dsfinvk.fiskaly.com/api/v1/_docs'
        : '/api/v1/_docs'
    }/postman/fiskaly.dsfinv-k.postman_environment.json).

      4. Start Postman and import the downloaded Postman collection and environment files.
    
        \`File > Import (Ctrl+O)\`
    
      5. Select the imported environment.
      
      6. Use the created API key and API secret from step 2 to set \`api_key\` and \`api_secret\` in the environment files. 
      
      7. Run the demo.
    
        \`Run > Run fiskaly demo ...\`
    
        <iframe width="768" height="480" src="https://www.youtube-nocookie.com/embed/oTebJnCa2dY?rel=0&amp;showinfo=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `),
    version,
    contact: {
      name: 'fiskaly GmbH',
      url: 'https://fiskaly.com',
      email: 'info@fiskaly.com',
    },
    'x-logo': {
      url: 'https://www.fiskaly.com/fiskaly_logo.svg',
      altText: 'fiskaly',
    },
  },
  basePath,
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Authentication',
      description: stripIndent(`
        Our API uses [JWT](#section/Authentication/JWT) tokens to authenticate requests.
        API requests without authentication will fail.
        All API requests have to be made over HTTP**S**, while requests made over plain HTTP will fail.

        If an \`/auth\` request using \`refresh_token\` fails in a \`401\` error, a regular \`/auth\` request with \`api_key\` and \`api_secret\` must be sent.

        <!-- ReDoc-Inject: <security-definitions> -->
      `),
    },
    {
      name: 'VAT Definition',
      description: stripIndent(`
      ### Definition of the turnover tax keys
      The assignment of the sales tax keys used is defined within the
      taxonomy cash data in the master data.
      In the following overview, the keys are shown with a description and the currently
      and the currently valid VAT percentage rates. In the case of a change
      of the percentage rates, a new taxonomy version is not necessary. The
      adjustment can be made at any time after a cash
      at any time. The description can be adapted individually (e.g.
      descriptions that are also printed on the receipts).
      printed on the receipts).

      ID | percentage (VAT rate) | description (description) /date of cash closure
      ---|---|---
      1 |   | Standard tax rate
      2 |   | Reduced tax rate
      3 |   | Average rate (§ 24 para. 1 no. 3 UStG) other cases
      4 |   | Average rate (§ 24 para. 1 no. 1 UStG)
      5 | 0.00 % | Non-taxable
      6 | 0.00 % | Exempt from VAT
      7 | 0.00 % | Non-taxable for turnover tax
      8-10 | | Reserved for changes in taxonomy 
      11 | 19.00 % | Historic general tax rate (§ 12 para. 1 UStG)
      12 | 7.00 % | Historic reduced tax rate (§ 12 para. 2 UStG)
      13 | 10.70 % | Historic average rate (§ 24 para. 1 no. 3 UStG) other cases
      14 | 5.50 %  | Historic average rate (§ 24 para. 1 no. 1 UStG)
      21 | 16.00 % | Historic general tax rate (§ 12 para. 1 UStG)
      22 | 5.00 % | Historic reduced tax rate (§ 12 para. 2 UStG)
      23 | 9.50 % | Historic average rate (§ 24 para. 1 no. 3 UStG) other cases
      up to 999 | | reserved for changes in taxonomy
      from 1000 | | individual circumstances (old tax rates, § 13b UStG, or similar)

      **The API provides ID 1-7 automatically. Only IDs from 1000 can be added or changed via the API.**
      `),
    },
    {
      name: 'Cash Register',
      description: stripIndent(`
        ### Cash register
        A cash register is characterised by the ability to both electronically accept incoming orders and to 
        and to complete the payment process electronically.
        
        ### Master-slave relationship in cash registers
        In many companies there are cash registers that both record business transactions and
        record business transactions and complete payment transactions. However, if
        individual cash registers (slaves) are closed via a central cash register (master),
        this is referred to as a master-slave cash register architecture. Purely digital
        digital ordering aids are not referred to as slave checkouts in this context.
        in this context.
        In this API, the master-slave relationship is established through the link to the corresponding client ID. 
        corresponding ClientID.  
      `),
    },
    {
      name: 'Purchaser Agency',
      description: stripIndent(`
        ### Agency information
        There are companies that collect so-called agency revenues on behalf of third parties. This circumstance 
        taxonomy takes this into account in that it is possible to define and reference several agencies for a cash register. 
        and to reference them.
      `),
    },
    {
      name: 'Cash Point Closing',
      description: stripIndent(`
      ### Cash closing
        The cash point closing is the aggregating summary of a cash point
        of all individual movements (transactions) with the transaction type
        'receipt' for a certain period of time. This means that only
        transactions are aggregated that are relevant for further processing for VAT and/or
        further processing for VAT and/or income tax purposes.
        
        All amounts are displayed to two decimal places.
        
        **Objective of the cash balance statement**
        * The cash balance statement provides the possibility to mathematically represent the counted cash balance of a cash register.
        * The cash balance statement provides an aggregated, systematised overview of the above-mentioned business transactions at the respective cash desk.
        
        The cash statement is created once, several times or for all calendar days for a cash register.
      `),
    },
    {
      name: 'Exports',
      description: stripIndent(`
        This export will provide a set of csv files according to DSFinV-K standard to comply with financial regulations.

        Endpoints for data export based on the Unified Digital Interface (Einheitliche Digitale Schnittstelle).
      `),
    },
  ],
  'x-tagGroups': [
    {
      name: 'Authentication',
      tags: ['Authentication'],
    },
    {
      name: 'Master Data',
      tags: ['VAT Definition', 'Purchaser Agency', 'Cash Register'],
    },
    {
      name: 'Cash Point Closing',
      tags: ['Cash Point Closing'],
    },
    {
      name: 'Exports',
      tags: ['Exports'],
    },
  ],
  securityDefinitions: {
    JWT: {
      description: stripIndent(`
        A JSON Web Token (JWT) used for access control and authorization.

        API keys have to be obtained via the [fiskaly dashboard](https://dashboard.fiskaly.com/).

        - Usage format: \`Bearer <JWT>\`
        - Example HTTP header: \`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
      `),
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  // definitions,
};

// --- start generated types ---

export * from './generated-types';

// --- end generated types ---

//
// Fake/Helper Types
//

export const HiddenStringType = {
  type: 'string',
  hide: true,
};

export const link = (description, href) => `[${description}](${href})`;

//
// Types
//

export const EnvType = {
  type: 'string',
  enum: ['TEST', 'LIVE'],
  example: 'TEST',
};

export const EnvsType = {
  type: 'array',
  description: 'Available environments',
  items: EnvType,
};

export const VersionType = {
  type: 'string',
  example: version,
};

export const OrderType = {
  type: 'string',
  description: 'Determines the sorting order',
  enum: ['asc', 'desc'],
  default: 'asc',
};

// export const MetadataType = define('Metadata', {
//   type: 'object',
//   description: stripIndent(`
//     You can use this parameter to attach custom key-value data to an object.
//     Metadata is useful for storing additional, structured information on an object.
//     *Note:* You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.
//   `),
//   example: {
//     my_property_1: '1234',
//     my_property_2: 'https://my-internal-system/path/to/resource/1234',
//   },
//   maxProperties: 20,
//   propertyNames: {
//     type: 'string',
//     maxLength: 40,
//   },
//   additionalProperties: {
//     type: 'string',
//     maxLength: 500,
//   },
// });

export const CountType = {
  type: 'integer',
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
  description: 'Number of available data items',
};

export const OrganizationIdType = {
  type: 'string',
  description: 'ID of the Organization',
  format: 'uuid',
  example: NIL_UUID,
};

export const ApiKeyIdType = {
  type: 'string',
  description: 'ID of the API Key',
  format: 'uuid',
  example: NIL_UUID,
};

export const ApiKeyKeyType = {
  type: 'string',
  description: 'Key of an API Key',
};

export const ApiKeySecretType = {
  type: 'string',
  description: 'Secret of an API Key (only given, when `POST` request)',
};

export const RefreshTokenType = {
  type: 'string',
  description: 'A token used for refreshing Tokens',
};

export const UserIdType = {
  type: 'string',
  description: 'ID of the User',
  format: 'uuid',
  example: NIL_UUID,
};

export const ApiKeyAuthenticationType = {
  type: 'object',
  properties: {
    api_key: ApiKeyKeyType,
    api_secret: ApiKeySecretType,
  },
  required: ['api_key', 'api_secret'],
  additionalProperties: false,
};

export const RefreshTokenAuthenticationType = {
  type: 'object',
  properties: {
    refresh_token: RefreshTokenType,
  },
  required: ['refresh_token'],
  additionalProperties: false,
};

//
// Requests
//

export const AuthenticationRequestType = {
  oneOf: [ApiKeyAuthenticationType, RefreshTokenAuthenticationType],
};

//
// Responses
//
// UGLY HACKS: instead of inheriting properties via allOf, we have to
// copy properties instead because fast-json-stringify does not support
// such advanced features... :/
//

export const AuthenticationResponseType = {
  type: 'object',
  description: 'Successful authentication',
  properties: {
    access_token: {
      type: 'string',
    },
    access_token_claims: {
      type: 'object',
      description: `Contains information about the claims that are embedded within the access token. Can be used to retrieve one's own \`organization_id\`.`,
      properties: {
        env: EnvType,
        organization_id: OrganizationIdType,
      },
      required: ['env', 'organization_id'],
    },
    access_token_expires_in: {
      type: 'integer',
      example: 300,
    },
    access_token_expires_at: UnixTimestampType,
    refresh_token: RefreshTokenType,
    refresh_token_expires_in: {
      type: 'integer',
      example: 300,
    },
    refresh_token_expires_at: UnixTimestampType,
  },
  required: [
    'access_token',
    'access_token_claims',
    'access_token_expires_in',
    'access_token_expires_at',
    'refresh_token',
    'refresh_token_expires_in',
    'refresh_token_expires_at',
  ],
};

export const StatusResponseType = {
  type: 'object',
  description: 'Status report',
  properties: {
    _success: {
      type: 'boolean',
    },
  },
  required: ['_success'],
};

//
// Parameters (no references allowed here, that's why we have to use resolve() here)
//

export const OrganizationIdParamsType = {
  type: 'object',
  properties: {
    organization_id: OrganizationIdType,
  },
  required: ['organization_id'],
};

export const OrganizationAndUserIdParamsType = {
  type: 'object',
  properties: {
    organization_id: OrganizationIdType,
    user_id: UserIdType,
  },
  required: ['organization_id', 'user_id'],
};

export const OrganizationAndApiKeyIdParamsType = {
  type: 'object',
  properties: {
    organization_id: OrganizationIdType,
    key_id: ApiKeyIdType,
  },
  required: ['organization_id', 'key_id'],
};

export const ClientIdParamsType = {
  type: 'object',
  properties: {
    client_id: ClientIdType,
  },
  required: ['client_id'],
};

//
// Querystring (no references allowed here, that's why we have to use resolve() here)
//

export const CollectionQuerystringType = {
  type: 'object',
  properties: {
    // order: OrderType,
    limit: {
      description: 'Limits the number of returned results',
      type: 'integer',
      maximum: 100,
      default: 100,
    },
    offset: {
      description: 'Skips the specified number of results from the result set',
      type: 'integer',
      default: 0,
    },
  },
};

export const VatDefinitionsQuerystringType = {
  type: 'object',
  properties: {
    order_by: {
      type: 'string',
      description: 'Specifies the property to sort by',
      enum: [
        'vat_definition_export_id',
        'time_creation',
        'time_update',
        'percentage',
      ],
      default: 'time_creation',
    },
    order: OrderType,
    ...CollectionQuerystringType.properties,
  },
};

export const CashRegisterQuerystringType = {
  type: 'object',
  properties: {
    order_by: {
      type: 'string',
      description: 'Specifies the property to sort by',
      enum: ['cash_register_type', 'time_creation', 'time_update'],
      default: 'time_creation',
    },
    order: OrderType,
    ...CollectionQuerystringType.properties,
  },
};

const createErrorCode = (codes = []) => {
  const code: {
    type: string;
    const?: any;
    enum?: any;
    example?: any;
  } = {
    type: 'string',
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

export const createErrorType = (description, codes = []) => ({
  type: 'object',
  description,
  properties: {
    code: createErrorCode(codes),
    message: {
      type: 'string',
    },
  },
});

export const createHttpErrorType = (statusCode, description, codes = []) => ({
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
      example: statusCodes[statusCode],
    },
  },
});

export const MetadataRequestType = {
  type: 'object',
  description: stripIndent(`
    You can use this parameter to attach custom key-value data to an object.
    Metadata is useful for storing additional, structured information on an object.
    Note: You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.
  `),
  example: {
    my_property_1: '1234',
    my_property_2: 'https://my-internal-system/path/to/resource/1234',
  },
  additionalProperties: {
    type: 'string',
  },
};

export const MetadataResponseType = {
  ...MetadataRequestType,
  description: 'Returns metadata',
};

export const RevisionType = {
  type: 'number',
  description: 'Revision of the Masterdata',
  minimum: 0,
  example: 0,
};

export const RevisionParamType = {
  type: 'object',
  properties: {
    revision: RevisionType,
  },
};

//todo: add this to schema
const cashRegisterPropertiesDefinition = {
  tss_id: TssIdType,
  ...CashRegisterType.properties,
  master_client_id: ClientIdType,
  // metadata: resolve(MetadataRequestType),
};

// export const CashRegisterType = define('CashRegister', {
//   type: 'object',
//   properties: cashRegisterPropertiesDefinition,
//   required: ['tss_id', 'base_currency_code'],
// });

// TODO cash_register
export const CashRegisterRequestType = {
  type: 'object',
  description: stripIndent(
    `Request Body Schema to either insert CashRegisters or Slaves.

    `,
  ),
  properties: {
    cash_register_type: {
      oneOf: [
        {
          type: 'object',
          description: 'Master',
          properties: {
            type: {
              type: 'string',
              enum: ['MASTER'],
            },
            tss_id: TssIdType,
          },
          required: ['type', 'tss_id'],
        },
        {
          type: 'object',
          description: 'Master with external TSS',
          properties: {
            type: {
              type: 'string',
              enum: ['MASTER'],
            },
            serial_number: SerialNumberType,
            signature_algorithm: SignatureAlgorithmType,
            signature_timestamp_format: SignatureTimestampFormatType,
            transaction_data_encoding: TransactionDataEncodingType,
            public_key: PublicKeyType,
            certificate: CertificateType,
          },
          required: [
            'type',
            'serial_number',
            'signature_algorithm',
            'signature_timestamp_format',
            'transaction_data_encoding',
            'public_key',
            'certificate',
          ],
        },
        {
          type: 'object',
          description: 'Slave without TSS',
          properties: {
            type: {
              type: 'string',
              enum: ['SLAVE_WITHOUT_TSS'],
            },
            master_client_id: ClientIdType,
          },
          required: ['type', 'master_client_id'],
        },
        {
          type: 'object',
          description: 'Slave with TSS',
          properties: {
            type: {
              type: 'string',
              enum: ['SLAVE_WITH_TSS'],
            },
            master_client_id: ClientIdType,
            tss_id: TssIdType,
          },
          required: ['type', 'master_client_id', 'tss_id'],
        },
      ],
    },
    ...Object.fromEntries(
      Object.entries(CashRegisterType.properties).filter(
        ([key]) =>
          key !== 'client_id' && key !== 'master_client_id' && key !== 'tss_id',
      ),
    ),
  },
  required: [
    'cash_register_type',
    ...CashRegisterType.required.filter(
      (x) => x !== 'client_id' && x !== 'tss_id',
    ),
  ],
};

export const CashRegisterResponseType = {
  type: 'object',
  description: 'Returns the cash register resource',
  properties: {
    cash_register_type: {
      type: 'string',
      enum: ['MASTER', 'SLAVE_WITHOUT_TSS', 'SLAVE_WITH_TSS'],
    },
    client_id: ClientIdType,
    revision: RevisionType,
    ...cashRegisterPropertiesDefinition,
    time_creation: UnixTimestampType,
    time_update: UnixTimestampType,
    _type: {
      type: 'string',
      const: 'CASH_REGISTER',
      example: 'CASH_REGISTER',
    },
    _env: EnvType,
    _version: VersionType,
    sign_api_version: SignApiVersionType,
    serial_number: SerialNumberType,
    signature_algorithm: SignatureAlgorithmType,
    signature_timestamp_format: SignatureTimestampFormatType,
    transaction_data_encoding: TransactionDataEncodingType,
    public_key: PublicKeyType,
    certificate: CertificateType,
  },
};

export const CashRegistersResponseType = {
  type: 'object',
  description: 'Returns the cash register list',
  properties: {
    data: {
      type: 'array',
      items: CashRegisterResponseType,
    },
    count: CountType,
    _type: {
      type: 'string',
      const: 'CASH_REGISTERS',
      example: 'CASH_REGISTERS',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

// const transactionSliceOfTaxonomy =
//   noRefDfkaTaxonomy.properties.cash_point_closing.properties.transactions.items;

// // we need to allow for a transaction without a corresponding item in the tse
// transactionSliceOfTaxonomy.properties.security = {
//   description: stripIndent(
//     `To fulfil security requirements it necessary to pass the link to a TSE transaction or if there is no corresponding
//     tse transaction a error message.`,
//   ),
//   oneOf: [
//     {
//       type: 'object',
//       properties: {
//         tx_id_or_number: {
//           type: 'string',
//           description: `Identifies a transaction by a \`tx_uuid\` (i.e. a self-generated UUIDv4) or a \`tx_number\` that gets assigned by us`,
//         },
//       },
//       required: ['tx_id_or_number'],
//     },
//     {
//       type: 'object',
//       properties: {
//         error_message: {
//           description:
//             'Bei TSE-Ausfall oder Fehler sollte hier eine aussagekräftige Fehlerbeschreibung eingetragen werden.',
//           type: 'string',
//           minLength: 1,
//           maxLength: 200,
//         },
//       },
//       required: ['error_message'],
//     },
//   ],
// };

// todo: once the offline log exists this should replace the security object
// transactionSliceOfTaxonomy.properties.tx_id_or_number = {
//   type: 'string',
//   description: stripIndent(
//     `Identifies a transaction by a tx_uuid (i.e. a self-generated UUIDv4) or a tx_number that gets assigned by us.
//     If the tx_id is not present in the KassenSichV API, it is assumed that this transaction will be recorded in the
//     offline log.`,
//   ),
// };

// export const TransactionType = define('Transaction', transactionSliceOfTaxonomy);

export const ClosingIdType = {
  type: 'string',
  description: 'ID of the cash point closing',
  format: 'uuid',
  example: NIL_UUID,
};

export const ClosingIdParamsType = {
  type: 'object',
  properties: {
    closing_id: ClosingIdType,
  },
  required: ['closing_id'],
};

// export const CashPointClosingType = define('CashPointClosing', {
//   type: 'object',
//   description:
//     'Der Kassenabschluss wird ein-, mehrmals oder kalendertagübergreifend für eine Kasse erstellt.',
//   properties: {
//     client_id: resolve(ClientIdType),
//     cash_statement: resolve(CashStatementType),
//     transactions: {
//       type: 'array',
//       description:
//         'Transactions are linked to the TSE transactions via the ID assigned in the KassenSichV API.',
//       items: resolve(TransactionType),
//     },
//     metadata: resolve(MetadataType),
//   },
//   required: ['client_id'],
// });

export const CashPointClosingInsertType = {
  ...CashPointClosingType,
  properties: {
    ...CashPointClosingType.properties,
    metadata: MetadataType,
  },
};

export const OperationStateEnum = [
  'PENDING',
  'WORKING',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
  'DELETED',
  'ERROR',
];

export const OperationStateType = {
  type: 'string',
  enum: OperationStateEnum,
  description: 'The current state of the operation.',
};

export const ErrorResponseType = {
  type: 'object',
  description:
    'If the state property is equal to `ERROR`, then the error is described by this property.',
  properties: {
    code: {
      type: 'string',
      description: 'Error code',
      example: 'E_CLIENT_NOT_FOUND',
    },
    message: {
      type: 'string',
      description: 'Error message',
      example: 'Client or Cash Register does not exist.',
    },
  },
};

export const CashPointClosingResponseType = {
  type: 'object',
  description: 'Returns the cash point closing resource',
  properties: {
    cash_point_closing: CashPointClosingType,
    state: OperationStateType,
    error: ErrorResponseType,
    time_creation: UnixTimestampType,
    time_update: UnixTimestampType,
    time_deleted: UnixTimestampType,
    metadata: MetadataType,
    _id: ClosingIdType,
    _type: {
      type: 'string',
      const: 'CASH_POINT_CLOSING',
      example: 'CASH_POINT_CLOSING',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

export const CashPointClosingsItemResponseType = {
  type: 'object',
  description: 'Returns the cash point closing resource',
  properties: {
    closing_id: ClosingIdType,
    cash_point_closing_export_id: {
      type: 'integer',
      description:
        'Each cash register assigns the cash balance number. This number is ascending, consecutive and cannot be reset. It may not be repeated within a cash register. The addition of the cash_register/id makes the cash statement unique.',
      minimum: 0,
    },
    state: OperationStateType,
    error: ErrorResponseType,
    client_id: ClientIdType,
    ...CashPointClosingType.properties.head.properties,
    full_amount: CashStatementType.properties.payment.properties.full_amount,
    cash_amount: CashStatementType.properties.payment.properties.cash_amount,
    metadata: MetadataType,
    time_creation: UnixTimestampType,
    time_update: UnixTimestampType,
    time_deleted: UnixTimestampType,
    _type: {
      type: 'string',
      const: 'CASH_POINT_CLOSING',
      example: 'CASH_POINT_CLOSING',
    },
    _env: EnvType,
    _version: VersionType,
    sign_api_version: SignApiVersionType,
  },
};

export const CashPointClosingsResponseType = {
  type: 'object',
  description: 'Returns all cash point closings resource',
  properties: {
    data: {
      type: 'array',
      items: CashPointClosingsItemResponseType,
    },
    count: CountType,
    _type: {
      type: 'string',
      const: 'CASH_POINT_CLOSING_LIST',
      example: 'CASH_POINT_CLOSING_LIST',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

const purchaserAgencyPropertiesDefinition = {
  ...PurchaserAgencyType.properties,
};

export const PurchaserAgencyParamsType = {
  type: 'object',
  properties: {
    purchaser_agency_id: PurchaserAgencyIdType,
  },
  required: ['purchaser_agency_id'],
};

export const PurchaserAgencyRequestType = {
  type: 'object',
  properties: {
    ...Object.fromEntries(
      Object.entries(purchaserAgencyPropertiesDefinition).filter(
        ([key]) => key !== 'purchaser_agency_id',
      ),
    ),
  },
  required: PurchaserAgencyType.required.filter(
    (x) => x !== 'purchaser_agency_id',
  ),
};

export const PurchaserAgencyResponseType = {
  type: 'object',
  description: 'Returns information about an existing purchaser agency.',
  properties: {
    purchaser_agency_id: PurchaserAgencyIdType,
    revision: RevisionType,
    // purchaser_agency_export_id:
    //   PurchaserAgencyType.properties.purchaser_agency_export_id,
    ...purchaserAgencyPropertiesDefinition,
    time_creation: UnixTimestampType,
    time_update: UnixTimestampType,
    _type: {
      type: 'string',
      const: 'PURCHASER_AGENCY',
      example: 'PURCHASER_AGENCY',
    },
    _env: EnvType,
    _version: VersionType,
    sign_api_version: SignApiVersionType,
  },
};

export const PurchaserAgenciesResponseType = {
  type: 'object',
  description: 'List all purchaser agencies',
  properties: {
    data: {
      type: 'array',
      items: PurchaserAgencyResponseType,
    },
    count: CountType,
    _type: {
      type: 'string',
      const: 'PURCHASER_AGENCIES',
      example: 'PURCHASER_AGENCIES',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

export const VatDefinitionCustomExportIdType = {
  ...VatDefinitionExportIdType,
  minimum: 1000,
};

const vatDefinitionPropertiesDefinition = {
  vat_definition_export_id: VatDefinitionExportIdType,
  ...VatDefinitionType.properties,
  metadata: MetadataType,
};

export const VatDefinitionParamsType = {
  type: 'object',
  properties: {
    vat_definition_export_id: VatDefinitionExportIdType,
  },
  required: ['vat_definition_export_id'],
};

export const VatDefinitionCustomParamsType = {
  type: 'object',
  properties: {
    vat_definition_export_id: VatDefinitionCustomExportIdType,
  },
  required: ['vat_definition_export_id'],
};

export const VatDefinitionRequestType = {
  type: 'object',
  properties: {
    ...VatDefinitionType.properties,
    metadata: MetadataRequestType,
  },
  required: ['percentage'],
};

export const VatDefinitionResponseType = {
  type: 'object',
  description: 'Returns information about an existing vat definition.',
  properties: {
    vat_definition_export_id: VatDefinitionExportIdType,
    ...vatDefinitionPropertiesDefinition,
    revision: RevisionType,
    time_creation: UnixTimestampType,
    time_update: UnixTimestampType,
    _type: {
      type: 'string',
      const: 'VAT_DEFINITION',
      example: 'VAT_DEFINITION',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

export const VatDefinitionsResponseType = {
  type: 'object',
  description: 'List all vat definitions',
  properties: {
    data: {
      type: 'array',
      items: VatDefinitionResponseType,
    },
    count: CountType,
    _type: {
      type: 'string',
      const: 'VAT_DEFINITIONS',
      example: 'VAT_DEFINITIONS',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

// const LinksType = {
//   type: 'array',
//   items: {
//     type: 'object',
//     properties: {
//       rel: {
//         type: 'string',
//       },
//       href: {
//         type: 'string',
//         format: 'uri',
//       },
//       title: {
//         type: 'string',
//       },
//       description: {
//         type: 'string',
//       },
//       method: {
//         type: 'string',
//         enum: ['GET', 'PUT', 'POST', 'DELETE'],
//         default: 'GET',
//       },
//     },
//     required: ['rel', 'href', 'method'],
//   },
// };

const ExportIdType = {
  type: 'string',
  format: 'uuid',
  example: NIL_UUID,
  description: 'Identifies an Export',
};

export const ExportResponseType = {
  type: 'object',
  properties: {
    state: OperationStateType,
    error: ErrorResponseType,
    // estimated_time_of_completion: {
    //   ...UnixTimestampType,
    //   description:
    //     'Estimated point in time when the state will change to `COMPLETED`.',
    // },
    time_request: {
      ...UnixTimestampType,
      description: 'Time of the initial request.',
    },
    time_start: {
      ...UnixTimestampType,
      description: 'Time of the start of the export operation.',
    },
    time_completed: {
      ...UnixTimestampType,
      description: 'Time of the completion of the export operation.',
    },
    time_expiration: {
      ...UnixTimestampType,
      description: 'Time of the expiration of the generated TAR file.',
    },
    time_error: {
      ...UnixTimestampType,
      description: 'Time of the error.',
    },
    cash_point_closings: {
      type: 'array',
      items: ClosingIdType,
    },
    // client_id: ClientIdType,
    metadata: MetadataRequestType,
    _type: {
      type: 'string',
      const: 'EXPORT',
      example: 'EXPORT',
    },
    _id: ExportIdType,
    // _links: LinksType,
    _env: EnvType,
    _version: VersionType,
    sign_api_version: SignApiVersionType,
  },
  required: ['state', 'time_request'],
  description: 'Returns the export resource',
};

export const ExportListResponseType = {
  type: 'object',
  description: 'Returns the Export list',
  properties: {
    data: {
      type: 'array',
      items: ExportResponseType,
    },
    count: CountType,
    _type: {
      type: 'string',
      const: 'EXPORT_LIST',
      example: 'EXPORT_LIST',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

export const ExportDownloadUrlResponseType = {
  type: 'object',
  description: 'Returns the download url of an export',
  properties: {
    href: {
      type: 'string',
      format: 'uri',
      example: 'https://....',
    },
    _env: EnvType,
    _version: VersionType,
  },
};

export const ExportStateQuerystringType = {
  type: 'string',
  enum: OperationStateEnum,
  uniqueItems: true,
  example: 'PENDING',
};

export const ExportCollectionQuerystringType = {
  type: 'object',
  properties: {
    ...CollectionQuerystringType.properties,
    order_by: {
      type: 'string',
      description: 'Specifies the property to sort by',
      enum: [
        'state',
        'time_request',
        'time_start',
        'time_completed',
        'time_error',
        'version',
      ],
      default: 'time_request',
    },
    order: OrderType,
    states: {
      oneOf: [
        {
          description: 'Filter to include only specific states',
          type: 'array',
          items: ExportStateQuerystringType,
          example: 'states=PENDING&states=WORKING',
        },
        ExportStateQuerystringType,
      ],
      description: 'Either `states=PENDING` or `states=PENDING&states=WORKING`',
    },
    client_id: ClientIdType,
    business_date_start: {
      type: 'string',
      format: 'date',
      description:
        "Filter for exports containing `cash_point_closings` with date >= `business_date` or if not defined `export_creation_date` in the format 'YYYY-MM-DD'.",
    },
    business_date_end: {
      type: 'string',
      format: 'date',
      description:
        "Filter for exports containing `cash_point_closings` with date <= `business_date` or if not defined `export_creation_date` in the format 'YYYY-MM-DD'.",
    },
  },
};

export const PurchaserAgencyCollectionQuerystringType = {
  type: 'object',
  properties: {
    client_id: ClientIdType,
    order_by: {
      type: 'string',
      description: 'Specifies the property to sort by',
      enum: [
        'name',
        'time_creation',
        'time_update',
        'purchaser_agency_export_id',
      ],
      default: 'time_creation',
    },
    order: OrderType,
    ...CollectionQuerystringType.properties,
  },
};

export const ExportParamsType = {
  type: 'object',
  properties: {
    export_id: ExportIdType,
  },
  required: ['export_id'],
};

export const ExportTriggerRequestType = {
  type: 'object',
  properties: {
    start_date: {
      ...UnixTimestampType,
      description:
        'Only export cash point closings with `time_creation` larger than or equal to the given start date.',
    },
    end_date: {
      ...UnixTimestampType,
      description:
        'Only export cash point closings with `time_creation` smaller than or equal to the given end date.',
    },
    client_id: ClientIdType,
    metadata: MetadataRequestType,
  },
  required: ['start_date', 'end_date'],
};

export const CashPointClosingCollectionQuerystringType = {
  type: 'object',
  properties: {
    client_id: ClientIdType,
    start_date: UnixTimestampType,
    end_date: UnixTimestampType,
    states: {
      oneOf: [
        {
          description: 'Filter to include only specific states',
          type: 'array',
          items: ExportStateQuerystringType,
          example: 'states=PENDING&states=WORKING',
        },
        ExportStateQuerystringType,
      ],
      description: 'Either `states=PENDING` or `states=PENDING&states=WORKING`',
    },
    order_by: {
      type: 'string',
      description: 'Specifies the property to sort by',
      enum: ['time_creation', 'state', 'business_date'],
      default: 'time_creation',
    },
    order: OrderType,
    ...CollectionQuerystringType.properties,
    business_date_start: {
      type: 'string',
      format: 'date',
      description:
        "Filter for exports containing `cash_point_closings` with date >= `business_date` or if not defined `export_creation_date` in the format 'YYYY-MM-DD'.",
    },
    business_date_end: {
      type: 'string',
      format: 'date',
      description:
        "Filter for exports containing `cash_point_closings` with date <= `business_date` or if not defined `export_creation_date` in the format 'YYYY-MM-DD'.",
    },
  },
};

//
// The following must stay exactly here, at the bottom of this file!
//

// if (require.main === module) {
//   (async function generateTypescriptTypes() {
//     const fs = require('fs').promises; // eslint-disable-line
//     const path = require('path'); // eslint-disable-line
//     const { compile } = require('json-schema-to-typescript'); // eslint-disable-line
//     const traverse = require('traverse'); // eslint-disable-line
//     const schema = {
//       definitions: traverse(definitions).map(function (value) {
//         if (this.key === '$name' || typeof value === 'undefined') {
//           return this.remove();
//         }
//         if (this.key === '$ref') {
//           const localRef = '#' + value.split('#').pop();
//           return this.update(localRef);
//         }
//         if (
//           value != null &&
//           typeof value === 'object' &&
//           value.type === 'object' &&
//           value.additionalProperties == null
//         ) {
//           // disallow additional properties by default
//           return this.update({ ...value, additionalProperties: false });
//         }
//       }),
//     };
//     let types = await compile(
//       {
//         ...dfkaTaxonomy,
//         definitions: {
//           ...dfkaTaxonomy.definitions,
//           ...dfkaTaxonomy.properties,
//         },
//       },
//       title,
//       {
//         unreachableDefinitions: true,
//         style: { singleQuote: true },
//       },
//     );
//     types += await compile(schema, title, {
//       unreachableDefinitions: true,
//       style: { singleQuote: true },
//     });
//     const output = path.resolve(__dirname, 'spec.d.ts');
//     await fs.writeFile(output, types);

//     const tsModelsOutput = path.resolve(__dirname, 'models.d.ts');
//     await fs.writeFile(tsModelsOutput, types);
//   })();
// }
