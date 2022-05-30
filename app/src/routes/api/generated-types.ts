export const ClientIdType = {
  type: 'string',
  format: 'uuid',
  example: '00000000-0000-0000-0000-000000000000',
  description: 'The UUID of the client in KassenSichV API',
};

export const ClientOrSlaveIdType = {
  type: 'string',
  format: 'uuid',
  example: '00000000-0000-0000-0000-000000000000',
  description:
    'The UUID of the client in KassenSichV API or a self-generated UUID of a slave',
};

export const TssIdType = {
  type: 'string',
  format: 'uuid',
  example: '00000000-0000-0000-0000-000000000000',
  description: 'The UUID of the TSE in KassenSichV API',
};

export const PurchaserAgencyIdType = {
  type: 'string',
  format: 'uuid',
  example: '00000000-0000-0000-0000-000000000000',
  description: 'The UUID of the purchasing agency.',
};

export const VatDefinitionIdType = {
  type: 'string',
  format: 'uuid',
  example: '00000000-0000-0000-0000-000000000000',
  description: 'UUID of the sales tax definition',
};

export const VatDefinitionExportIdType = {
  type: 'integer',
  description:
    'Fixed sales tax references are assigned here. Tax rates 1-7 are fixed, 8-999 are reserved, and 1000-99999999 are available for free use.',
  minimum: 1,
  maximum: 9999999999,
};

export const MetadataType = {
  type: 'object',
  description:
    'This parameter allows you to attach custom key value data to an object. Metadata is useful for storing additional, structured information about an object. *Note:* You can specify up to 20 keys, with key names up to 40 characters long and values up to 500 characters long.',
  example: {
    my_property_1: '1234',
    my_property_2: 'https://my-internal-system/path/to/resource/1234',
  },
  maxProperties: 20,
  propertyNames: {
    type: 'string',
    maxLength: 40,
  },
  additionalProperties: {
    type: 'string',
    maxLength: 500,
  },
};

export const UnixTimestampType = {
  type: 'integer',
  min: 0,
  max: 2147483647,
  description:
    'A timestamp / point in time, measured in seconds since the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time)',
  example: 1577833200,
};

export const NameType = {
  type: 'string',
  description: 'Specify the current official (company) name here.',
  minLength: 1,
  maxLength: 60,
};

export const CountryCodeType = {
  type: 'string',
  minLength: 3,
  maxLength: 3,
  pattern: '^[A-Z]{3}$',
  description: 'Country code according to ISO 3166 alpha-3',
};

export const AddressStrictType = {
  type: 'object',
  properties: {
    street: {
      type: 'string',
      minLength: 1,
      maxLength: 60,
    },
    postal_code: {
      type: 'string',
      minLength: 1,
      maxLength: 10,
    },
    city: {
      type: 'string',
      minLength: 1,
      maxLength: 62,
    },
    country_code: CountryCodeType,
  },
  required: ['street', 'postal_code', 'city', 'country_code'],
};

export const AddressOptionalType = {
  type: 'object',
  properties: {
    street: {
      type: 'string',
      minLength: 1,
      maxLength: 60,
    },
    postal_code: {
      type: 'string',
      minLength: 1,
      maxLength: 10,
    },
    city: {
      type: 'string',
      minLength: 1,
      maxLength: 62,
    },
    country_code: CountryCodeType,
  },
};

export const TaxNumberType = {
  type: 'string',
  description:
    'Either the tax number (tax_number) or VAT number (vat_id_number) of the company must be specified (§ 14 para. 4 no. 2 UStG)',
  minLength: 1,
  maxLength: 20,
};

export const VatIdNumberType = {
  type: 'string',
  description: 'VAT identification number',
  minLength: 1,
  maxLength: 15,
  pattern: '^[A-Z]{2}.{1,13}$',
};

export const VatAmountGrossAndNetType = {
  type: 'object',
  properties: {
    incl_vat: {
      type: 'number',
      minimum: -9999999999.99999,
      maximum: 9999999999.99999,
      customMultipleOf: 0.00001,
    },
    excl_vat: {
      type: 'number',
      minimum: -9999999999.99999,
      maximum: 9999999999.99999,
      customMultipleOf: 0.00001,
    },
    vat: {
      type: 'number',
      minimum: -9999999999.99999,
      maximum: 9999999999.99999,
      customMultipleOf: 0.00001,
    },
    vat_definition_export_id: VatDefinitionExportIdType,
  },
  required: ['vat_definition_export_id', 'incl_vat', 'excl_vat', 'vat'],
};

export const VatAmountGrossAndNetReceiptType = {
  type: 'object',
  properties: {
    incl_vat: {
      type: 'number',
      minimum: -9999999999.99,
      maximum: 9999999999.99,
      customMultipleOf: 0.00001,
    },
    excl_vat: {
      type: 'number',
      minimum: -9999999999.99,
      maximum: 9999999999.99,
      customMultipleOf: 0.00001,
    },
    vat: {
      type: 'number',
      minimum: -9999999999.99,
      maximum: 9999999999.99,
      customMultipleOf: 0.00001,
    },
    vat_definition_export_id: VatDefinitionExportIdType,
  },
  required: ['vat_definition_export_id', 'incl_vat', 'excl_vat', 'vat'],
};

export const VatAmountsGrossAndNetType = {
  type: 'array',
  items: VatAmountGrossAndNetType,
};

export const VatAmountsGrossAndNetReceiptType = {
  type: 'array',
  items: VatAmountGrossAndNetReceiptType,
};

export const AmountType = {
  type: 'number',
  minimum: -9999999999.99,
  maximum: 9999999999.99,
  multipleOf: 0.00001,
};

export const QuantityType = {
  type: 'number',
  minimum: -9999999999.999,
  maximum: 9999999999.999,
  multipleOf: 0.001,
};

export const PercentageType = {
  type: 'number',
  minimum: 0,
  maximum: 100,
  multipleOf: 0.00001,
};

export const CurrencyType = {
  type: 'string',
  minLength: 3,
  maxLength: 3,
  pattern: '^[A-Z]{3}$',
  description:
    'Each cash statement has only one base currency. The base currency specification refers to the base currency of the cash register. The base currency is represented according to ISO 4217 (column: ISO code) Ex: Euro = EUR; All payments in foreign currency on the single document are converted to the base currency in the cash statement.',
};

export const TransactionTypeType = {
  type: 'string',
  enum: [
    'Beleg',
    'AVTransfer',
    'AVBestellung',
    'AVTraining',
    'AVBelegstorno',
    'AVBelegabbruch',
    'AVSachbezug',
    'AVSonstige',
    'AVRechnung',
  ],
  description:
    'The transaction type arranges and divides all transactions into business transactions (document) and other transactions. This assignment also controls further processing in the cash closing. Only single transactions with the transaction type document are relevant for the cash closing. Invoices, delivery bills, corrections, etc. are displayed in the document. If single transactions are processed from other basic recording systems of the company, these single transactions must not have the transaction type document',
};

export const PaymentTypeType = {
  type: 'string',
  enum: [
    'Bar',
    'Unbar',
    'ECKarte',
    'Kreditkarte',
    'ElZahlungsdienstleister',
    'GuthabenKarte',
    'Keine',
  ],
};

export const BusinessCaseTypeType = {
  type: 'string',
  enum: [
    'Anfangsbestand',
    'Umsatz',
    'Pfand',
    'PfandRueckzahlung',
    'MehrzweckgutscheinKauf',
    'MehrzweckgutscheinEinloesung',
    'EinzweckgutscheinKauf',
    'EinzweckgutscheinEinloesung',
    'Forderungsentstehung',
    'Forderungsaufloesung',
    'Anzahlungseinstellung',
    'Anzahlungsaufloesung',
    'Privateinlage',
    'Privatentnahme',
    'Geldtransit',
    'DifferenzSollIst',
    'TrinkgeldAG',
    'TrinkgeldAN',
    'Auszahlung',
    'Einzahlung',
    'Rabatt',
    'Aufschlag',
    'Lohnzahlung',
    'ZuschussEcht',
    'ZuschussUnecht',
  ],
};

export const BusinessCaseType = {
  description:
    'The business_case qualifies the business transaction in the single movement and in the cash closure in terms of subject matter and content.',
  type: 'object',
  properties: {
    type: BusinessCaseTypeType,
    name: {
      description:
        'The name subdivides the business_case more deeply in terms of subject and content. No, one or more names can be assigned to a business_case.',
      type: 'string',
      minLength: 1,
      maxLength: 40,
    },
    purchaser_agency_id: PurchaserAgencyIdType,
    amounts_per_vat_id: VatAmountsGrossAndNetType,
  },
  required: ['type', 'amounts_per_vat_id'],
};

export const BusinessCaseLineType = {
  description: 'The business_case of a line can only be either gross or net.',
  properties: {
    type: BusinessCaseTypeType,
    name: {
      description:
        'The name subdivides the business_case more deeply in terms of subject and content. No, one or more names can be assigned to a business_case.',
      type: 'string',
      minLength: 1,
      maxLength: 40,
    },
    purchaser_agency_id: PurchaserAgencyIdType,
    amounts_per_vat_id: VatAmountsGrossAndNetType,
  },
  required: ['type', 'amounts_per_vat_id'],
};

export const ReferenceType = {
  description:
    "'Reference' describes a reference to taxonomy transaction or a delivery bill or invoice from a third-party system.",
  oneOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['ExterneRechnung', 'ExternerLieferschein'],
        },
        date: UnixTimestampType,
        external_export_id: {
          type: 'string',
          minLength: 1,
          maxLength: 40,
        },
      },
      required: ['type', 'external_export_id'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['ExterneSonstige'],
        },
        name: {
          type: 'string',
          description: 'Name to specify the external reference in more detail',
          minLength: 1,
          maxLength: 40,
        },
        date: UnixTimestampType,
        external_other_export_id: {
          type: 'string',
          minLength: 1,
          maxLength: 40,
        },
      },
      required: ['type', 'external_other_export_id', 'name'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['Transaktion'],
        },
        date: UnixTimestampType,
        cash_point_closing_export_id: {
          type: 'integer',
          minimum: 0,
        },
        cash_register_export_id: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
        transaction_export_id: {
          type: 'string',
          minLength: 1,
          maxLength: 40,
        },
      },
      required: [
        'type',
        'cash_point_closing_export_id',
        'cash_register_export_id',
        'transaction_export_id',
      ],
    },
    {
      type: 'object',
      description:
        'Link to a transaction that is also within the fiskaly DSFinV-K API',
      properties: {
        type: {
          type: 'string',
          enum: ['InterneTransaktion'],
        },
        tx_id: {
          type: 'string',
          description: 'UUID of the transaction to be linked.',
          format: 'uuid',
          example: '00000000-0000-0000-0000-000000000000',
        },
      },
      required: ['type', 'tx_id'],
    },
  ],
};

export const DatetimeType = {
  type: 'string',
  description:
    'Timestamp according to ISO 8601 and RFC3339 e.g. 2016-09-27T17:00:01+01:00 (Local time); this is the time when the cash closure was created.',
  format: 'date-time',
};

export const CashAmountByCurrencyType = {
  type: 'object',
  properties: {
    currency_code: CurrencyType,
    amount: AmountType,
  },
  required: ['currency_code', 'amount'],
};

export const PaymentTypeItemType = {
  type: 'object',
  description: 'Subdivision of paid amounts by payment type and currency.',
  properties: {
    type: PaymentTypeType,
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 60,
    },
    currency_code: CurrencyType,
    foreign_amount: AmountType,
    amount: AmountType,
  },
  required: ['type', 'currency_code', 'amount'],
};

export const SublineItemType = {
  type: 'object',
  properties: {
    number: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    gtin: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 60,
    },
    quantity: QuantityType,
    quantity_factor: {
      type: 'number',
      multipleOf: 0.001,
      maximum: 99999.999,
      exclusiveMinimum: 0,
    },
    quantity_measure: {
      type: 'string',
      description:
        'Measure denotes the unit of measure. If the unit of measure field is empty, the unit of piece automatically applies.',
      minLength: 1,
      maxLength: 50,
    },
    group_id: {
      type: 'string',
      description:
        'Unique ID of the merchandise group, for example, the merchandise group number.',
      minLength: 1,
      maxLength: 40,
    },
    group_name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    amount_per_vat_id: VatAmountGrossAndNetType,
  },
  required: ['number', 'quantity', 'amount_per_vat_id'],
};

export const LineItemType = {
  type: 'object',
  properties: {
    business_case: BusinessCaseLineType,
    in_house: {
      type: 'boolean',
      description: 'Indicates an in_house sale or out of house sale.',
      default: true,
    },
    storno: {
      type: 'boolean',
      description: 'Indicates a line-level cancellation operation.',
    },
    references: {
      type: 'array',
      description:
        'References to external delivery bills, invoices, or transactions of a taxonomy cash closing.',
      items: ReferenceType,
      minItems: 1,
    },
    voucher_id: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    text: {
      type: 'string',
      description: 'Description of the line or name of the item.',
      minLength: 0,
      maxLength: 255,
    },
    item: {
      type: 'object',
      description:
        'Within the transaction, the item forms the parenthesis around all item-specific information.',
      properties: {
        number: {
          type: 'string',
          description:
            "Identifies a unique number used to maintain and manage the item, product, or merchandise category in the company's systems.",
          minLength: 1,
          maxLength: 50,
        },
        gtin: {
          type: 'string',
          description:
            'The Global Trade Item Number (GTIN) is an international, unique number used to identify products. It is managed and assigned worldwide by GS1. The formerly common designation European Article Number (EAN) was replaced by the GTIN in 2009. ',
          minLength: 1,
          maxLength: 50,
        },
        quantity: QuantityType,
        quantity_factor: {
          type: 'number',
          multipleOf: 0.001,
          maximum: 99999.999,
          exclusiveMinimum: 0,
        },
        quantity_measure: {
          type: 'string',
          description:
            'Measure denotes the unit of measure. If the unit of measure field is empty, the unit of piece automatically applies.',
          minLength: 1,
          maxLength: 50,
        },
        group_id: {
          type: 'string',
          description:
            'Unique ID of the merchandise group, for example, the merchandise group number.',
          minLength: 1,
          maxLength: 40,
        },
        group_name: {
          type: 'string',
          description: 'Describes the name of the merchandise group.',
          minLength: 1,
          maxLength: 50,
        },
        price_per_unit: {
          description:
            'PricePerUnit is the item base price for quantity quantity_factor of the unit of measure specified by quantity_measure.',
          type: 'number',
          minimum: -9999999999.99999,
          maximum: 9999999999.99999,
          multipleOf: 0.00001,
        },
        base_amounts_per_vat_id: VatAmountsGrossAndNetType,
        discounts_per_vat_id: VatAmountsGrossAndNetType,
        extra_amounts_per_vat_id: VatAmountsGrossAndNetType,
        sub_items: {
          type: 'array',
          description:
            'The SubItems create the possibility to explain the composition of sold products or merchandise group descriptions on item level. Example: menuI = cola and hamburger. The SubItems do not have to be filled. They have explanatory character and no expressiveness regarding price and sales tax.',
          items: SublineItemType,
          minItems: 1,
        },
      },
      required: ['number', 'quantity', 'price_per_unit'],
    },
    lineitem_export_id: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
  },
  required: ['business_case', 'lineitem_export_id', 'storno', 'text', 'item'],
};

export const TransactionType = {
  type: 'object',
  description:
    'Forms the bracket around a single individual transaction. So is the single document or single receipt. Also the transaction breaks down into header and transaction data.',
  properties: {
    head: {
      type: 'object',
      description:
        'The transaction header contains all the master data for the single transaction.',
      properties: {
        type: TransactionTypeType,
        name: {
          type: 'string',
          description:
            'Optional name of the transaction (mandatory for transaction type AVOther!)',
          minLength: 1,
          maxLength: 60,
        },
        storno: {
          type: 'boolean',
          description:
            'Indicates a global reversal operation at document level.',
        },
        number: {
          type: 'integer',
          description:
            'The receipt number is to be kept consecutive in the cash closure. However, it may be repeated during the life cycle of a cash point. ',
          minimum: 0,
        },
        timestamp_start: UnixTimestampType,
        timestamp_end: UnixTimestampType,
        user: {
          type: 'object',
          description:
            'The user is the person officially responsible for accounting for the single transaction at the cash register. (Ex: Operator records or receipts, User cashes)',
          properties: {
            name: {
              type: 'string',
              description:
                "The user's name is stored in the cash register system.",
              minLength: 1,
              maxLength: 50,
            },
            user_export_id: {
              type: 'string',
              description: 'The user has an internal company identifier.',
              minLength: 1,
              maxLength: 50,
            },
          },
          required: ['user_export_id'],
        },
        buyer: {
          type: 'object',
          description:
            "Forms the bracket around all data about a buyer. Background: From an invoice amount of 200,00€ the so called small amount limit of an invoice is exceeded. Then the buyer's address must be entered. For this purpose, the fields below the bracket [buyer] are used. There is also a name and the corresponding address here.",
          properties: {
            name: {
              type: 'string',
              description: 'The name of the buyer.',
              minLength: 1,
              maxLength: 50,
            },
            type: {
              enum: ['Kunde', 'Mitarbeiter'],
              type: 'string',
            },
            address: AddressOptionalType,
            vat_id_number: VatIdNumberType,
            buyer_export_id: {
              type: 'string',
              description: 'The customer number of the buyer.',
              minLength: 1,
              maxLength: 50,
            },
          },
          required: ['name', 'buyer_export_id', 'type'],
        },
        references: {
          type: 'array',
          description:
            'References to external delivery bills, invoices, or transactions of a taxonomy cash closing.',
          items: ReferenceType,
          minItems: 1,
        },
        allocation_groups: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'The accounting group is a variable entity that can be used to assign a single transaction to a specific criterion (table, department, etc.).',
            minLength: 1,
            maxLength: 50,
          },
        },
        tx_id: {
          type: 'string',
          format: 'uuid',
          example: '00000000-0000-0000-0000-000000000000',
          description:
            'UUID of a transaction. This ID should match the TX ID in the TSE API. If there is no corresponding entry in the TSE API, it is user-definable.',
        },
        transaction_export_id: {
          type: 'string',
          description:
            'Id of the transaction assigned automatically and invariably by the cash system. The Id must be unique within a cash point closing.',
          minLength: 1,
          maxLength: 40,
        },
        closing_client_id: {
          type: 'string',
          format: 'uuid',
          example: '00000000-0000-0000-0000-000000000000',
          description:
            'The client ID of the master cash register or slave cash register (terminal) where the transaction was performed.',
        },
      },
      required: [
        'tx_id',
        'transaction_export_id',
        'closing_client_id',
        'type',
        'storno',
        'number',
        'timestamp_start',
        'timestamp_end',
        'user',
        'buyer',
      ],
    },
    data: {
      type: 'object',
      description:
        'Forms the parenthesis around all transaction data of a single receipt. TransactionData distinguish the data into total amount with breakdown into payment types and sales tax issues, additional notes, receipt items with item or merchandise category reference, and receipt items without item or merchandise category reference.',
      properties: {
        full_amount_incl_vat: AmountType,
        payment_types: {
          type: 'array',
          items: PaymentTypeItemType,
        },
        amounts_per_vat_id: VatAmountsGrossAndNetReceiptType,
        notes: {
          type: 'string',
          description:
            'Appropriate additional notes are recorded under [notes].',
          minLength: 1,
          maxLength: 255,
        },
        lines: {
          type: 'array',
          description:
            'Each receipt that defines a transaction at the cash register is called a transaction. A transaction can consist of one or more business transactions. These business transactions are called [lines] in the following. The taxonomy distinguishes between ItemLine and TypeLine. The ItemLine stands for business transactions that have a reference to an item, product or merchandise category.',
          items: LineItemType,
        },
      },
      required: [
        'full_amount_incl_vat',
        'payment_types',
        'amounts_per_vat_id',
        'lines',
      ],
    },
    security: {
      description:
        'To meet the security requirements, it is necessary to pass the link to a TSE transaction or, if there is no corresponding\\n TSE transaction, an error message.',
      oneOf: [
        {
          type: 'object',
          properties: {
            tss_tx_id: {
              type: 'string',
              description:
                'Identifies a transaction in the Sign API by a \\`tx_uuid\\` (i.e., a self-generated UUIDv4).',
            },
          },
          required: ['tss_tx_id'],
        },
        {
          type: 'object',
          properties: {
            error_message: {
              description:
                'In case of TSE failure or error, a meaningful error description should be entered here.',
              type: 'string',
              minLength: 1,
              maxLength: 200,
            },
          },
          required: ['error_message'],
        },
        {
          type: 'object',
          properties: {
            tx_number: {
              description: 'Transaction number of the transaction',
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
            tx_start: {
              description:
                'The timestamp for TSE-Log-Time of the StartTransaction operation (BSI TR-03153 / BSI TR-03151)',
              type: 'string',
              example: '2020-10-10T12:00:10.000Z',
              pattern:
                '^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z)$',
            },
            tx_end: {
              description:
                'The timestamp for TSE-Log-Time of the FinishTransaction operation (BSI TR-03153 / BSI TR-03151)',
              type: 'string',
              example: '2020-10-10T12:00:10.000Z',
              pattern:
                '^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z)$',
            },
            process_type: {
              description: 'The processType of the FinishTransaction operation',
              type: 'string',
              enum: ['Kassenbeleg-V1', 'Bestellung-V1', 'SonstigerVorgang'],
              example: 'Kassenbeleg-V1',
            },
            process_data: {
              description: 'processData of the transaction',
              type: 'string',
              allOf: [{ transform: ['trim'] }],
              example: 'Beleg^0.00_2.55_0.00_0.00_0.00^2.55:Bar',
            },
            signature_counter: {
              description:
                'Signature counter of the FinishTransaction operation',
              type: 'string',
              pattern: '^\\d+$',
              example: '0',
            },
            signature: {
              description:
                'Signature of the FinishTransaction operation encoded in `base64`',
              type: 'string',
              maxLength: 512,
              example: 'mock-signature',
            },
            error_message: {
              description:
                'Error message in case there was a problem between the ERS and the TSS',
              type: 'string',
              maxLength: 200,
            },
          },
          required: [
            'tx_number',
            'tx_start',
            'tx_end',
            'signature_counter',
            'signature',
          ],
        },
      ],
    },
  },
  required: ['head', 'data', 'security'],
};

export const CashStatementType = {
  type: 'object',
  description:
    'All transactions of a cash register are represented in the CashStatement. The cash statement of a cash register represents the business transactions in one block and the cash flows in a second block.',
  properties: {
    business_cases: {
      type: 'array',
      items: BusinessCaseType,
    },
    payment: {
      type: 'object',
      description:
        'The payment type forms the second block of the CashStatement and breaks down the total payment flow at a cash point into different payment types.',
      properties: {
        full_amount: AmountType,
        cash_amount: AmountType,
        cash_amounts_by_currency: {
          description: 'A breakdown of all cash receipts by currency.',
          type: 'array',
          items: CashAmountByCurrencyType,
        },
        payment_types: {
          type: 'array',
          items: PaymentTypeItemType,
        },
      },
      required: [
        'full_amount',
        'cash_amount',
        'cash_amounts_by_currency',
        'payment_types',
      ],
    },
  },
  required: ['business_cases', 'payment'],
};

export const SignApiVersionType = {
  type: 'number',
  enum: [1, 2],
  deprecated: true,
  description:
    '**WARNING:** This field is **DEPRECATED** and will be removed in the next major version!\n\n' +
    'The sign API version that was used. Version 1 will also handle version 0.',
};

export const CashRegisterType = {
  type: 'object',
  description:
    'The parenthesis around all the details of the particular cash point.',
  properties: {
    brand: {
      type: 'string',
      description: 'Identifies the brand of the cash register manufacturer.',
      minLength: 1,
      maxLength: 50,
    },
    model: {
      type: 'string',
      description: 'Describes the model of the particular cash register.',
      minLength: 1,
      maxLength: 50,
    },
    software: {
      type: 'object',
      properties: {
        brand: {
          type: 'string',
          description:
            'The name of the respective cash register software is listed here.',
          minLength: 1,
          maxLength: 50,
        },
        version: {
          type: 'string',
          description:
            'The version description of the respective software is given here.',
          minLength: 1,
          maxLength: 50,
        },
      },
      anyOf: [
        {
          required: ['brand'],
        },
        {
          required: ['version'],
        },
      ],
    },
    base_currency_code: CurrencyType,
    processing_flags: {
      type: 'object',
      description:
        'Enabling this field indicates that this cash register cannot make a sales tax assignment at the time the receivable is closed. If this setting is to be changed, it is mandatory to create a cash closing first. Thus, the sales tax assignment is made at the time of delivery and service in any case.',
      properties: {
        UmsatzsteuerNichtErmittelbar: {
          type: 'boolean',
        },
      },
    },
    client_id: ClientOrSlaveIdType,
    master_client_id: ClientIdType,
    tss_id: TssIdType,
    metadata: MetadataType,
  },
  required: [
    'client_id',
    'tss_id',
    'brand',
    'model',
    'base_currency_code',
    'software',
  ],
};

export const VatDefinitionType = {
  type: 'object',
  properties: {
    percentage: PercentageType,
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 55,
    },
    metadata: MetadataType,
  },
  anyOf: [
    {
      properties: {
        id: {
          type: 'integer',
          minimum: 1,
          maximum: 7,
        },
      },
    },
    {
      properties: {
        id: {
          type: 'integer',
          minimum: 1000,
          maximum: 9999999999,
        },
      },
      required: ['description'],
    },
  ],
  required: ['id', 'percentage'],
};

export const PurchaserAgencyType = {
  type: 'object',
  properties: {
    name: NameType,
    address: AddressStrictType,
    tax_number: TaxNumberType,
    vat_id_number: VatIdNumberType,
    purchaser_agency_id: PurchaserAgencyIdType,
    purchaser_agency_export_id: {
      type: 'integer',
      description:
        'Referencing all agency purchaser data for agency sales to an ID is done at this location. Numbers 1 - 9999999999 are accepted for the ID. Only whole numbers are accepted. The order must be ascending in increments of 1.',
      minimum: 0,
    },
    client_id: ClientIdType,
    metadata: MetadataType,
  },
  required: [
    'purchaser_agency_id',
    'purchaser_agency_export_id',
    'client_id',
    'name',
    'address',
    'tax_number',
  ],
};

export const CashPointClosingType = {
  type: 'object',
  description:
    'The cash closing is created once, multiple times, or across calendar days for a cash register.',
  properties: {
    head: {
      type: 'object',
      description:
        'This bracket displays the central master data of the cash closing.',
      properties: {
        business_date: {
          type: 'string',
          format: 'date',
          description:
            "The optional posting date of the cash closing, e.g. for posting to financial accounting. The posting date must be specified if it is different from the creation date. It is specified according to ISO 8601 and RFC3339 in the format 'YYYY-MM-DD'.",
        },
        first_transaction_export_id: {
          type: ['string', 'null'],
          description:
            'The id of the first transaction that flows into a cash point closing.',
          maxLength: 40,
        },
        last_transaction_export_id: {
          type: ['string', 'null'],
          description:
            'The Id of the last transaction that flows into a cash closure.',
          maxLength: 40,
        },
        export_creation_date: UnixTimestampType,
      },
      required: [
        'export_creation_date',
        'first_transaction_export_id',
        'last_transaction_export_id',
      ],
    },
    cash_statement: CashStatementType,
    transactions: {
      type: 'array',
      description:
        'Forms the bracket around all individual transactions of a cash point closing.',
      items: TransactionType,
    },
    client_id: ClientIdType,
    cash_point_closing_export_id: {
      type: 'integer',
      description:
        'Each cash register assigns the cash closing number. This is ascending, consecutive, non-resettable. It must not be repeated within a cash register. Adding the cash_register/id makes the cash closure unique.',
      minimum: 0,
    },
  },
  required: [
    'client_id',
    'cash_point_closing_export_id',
    'head',
    'cash_statement',
    'transactions',
  ],
};

export const SerialNumberType = {
  type: 'string',
  hex: true,
  example: 'fd00000aa8660b5b010006acdc',
  description: 'The serial number of the external TSS in hexadecimal numbers',
};
export const SignatureAlgorithmType = {
  type: 'string',
  example: 'SHA-256',
  description: 'The algorithm type used for the TSS signature.',
};
export const SignatureTimestampFormatType = {
  type: 'string',
  enum: [
    'unixTime',
    'utcTime',
    'utcTimeWithSeconds',
    'generalizedTime',
    'generalizedTimeWithMilliseconds',
  ],
  example: 'unixTime',
  description: 'The signature timestamp format of the external TSS',
};
export const TransactionDataEncodingType = {
  type: 'string',
  enum: ['UTF-8', 'ASCII'],
  example: 'UTF-8',
  description: 'The encoding type of the `processData`',
};
export const PublicKeyType = {
  type: 'string',
  format: 'byte',
  example: 'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7',
  description: `The external TSS's public key`,
};
export const CertificateType = {
  type: 'string',
  format: 'byte',
  example: 'MDN3TkJ8VSdcWDlLd0lfIjVhVjxXeFM7',
  description: `The external TSS's certificate`,
};
