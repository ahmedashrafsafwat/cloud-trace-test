exports.up = async function (sql) {
  try {
    await sql`
      CREATE TYPE "tx_type" AS ENUM (
        'Beleg',
        'AVTransfer',
        'AVBestellung',
        'AVTraining',
        'AVBelegstorno',
        'AVBelegabbruch',
        'AVSachbezug',
        'AVSonstige',
        'AVRechnung'
      );
    `;

    await sql`
      CREATE TYPE "type_cpc_t" AS ENUM (
        'cash_point_closing',
        'transaction'
      );
    `;

    await sql`
      CREATE TYPE "type_t_li" AS ENUM (
        'transaction',
        'lineitem'
      );
    `;

    await sql`
      CREATE TYPE "payment_type" AS ENUM (
        'Bar',
        'Unbar',
        'ECKarte',
        'Kreditkarte',
        'ElZahlungsdienstleister',
        'GuthabenKarte',
        'Keine'
      );
    `;

    await sql`
      CREATE TYPE "business_case_type" AS ENUM (
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
        'ZuschussUnecht'
      );
    `;

    await sql`
      CREATE TYPE "amount_type" AS ENUM (
        'transaction',
        'business_case',
        'lineitem_base_amounts',
        'lineitem_discounts',
        'lineitem_extra_amounts'
      );
    `;

    await sql`
      CREATE TYPE "external_references_type" AS ENUM (
        'ExterneRechnung',
        'ExternerLieferschein',
        'ExterneSonstige'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "cash_point_closings" (
        "cash_point_closing_id" uuid PRIMARY KEY,
        "client_id" uuid NOT NULL,
        "client_revision" smallint NOT NULL,
        "payment_full_amount" numeric(12,2) NOT NULL,
        "payment_cash_amount" numeric(12,2) NOT NULL,
        "env" environment NOT NULL,
        "version" integer NOT NULL,
        "metadata" json,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "time_update" timestamp DEFAULT now () NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "transaction_id" uuid PRIMARY KEY,
        "cash_point_closing_id" uuid NOT NULL,
        "tse_tx_id" uuid,
        "type" tx_type NOT NULL,
        "storno" boolean NOT NULL,
        "transaction_export_id" varchar(40) NOT NULL,
        "bon_number" integer NOT NULL,
        "timestamp_start" timestamp NOT NULL,
        "timestamp_end" timestamp NOT NULL,
        "name" varchar(60),
        "user_id" varchar(50) NOT NULL,
        "user_name" varchar(50),
        "buyer" json NOT NULL,
        "allocation_groups" json,
        "full_amount_incl_vat" numeric(12,2) NOT NULL,
        "notes" varchar(255),
        "reference_transaction_uuid" uuid
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "business_cases" (
        "business_case_id" uuid PRIMARY KEY,
        "cash_point_closing_id" uuid,
        "type" varchar(30) NOT NULL,
        "name" varchar(40),
        "purchaser_agency_id" uuid,
        "purchaser_agency_revision" smallint
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "cash_amounts_by_currency" (
        "currency_code" char(3) NOT NULL,
        "amount" numeric(15,5) NOT NULL,
        "cash_point_closing_id" uuid NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "payment_types" (
        "payment_type_id" uuid PRIMARY KEY,
        "transaction_id" uuid,
        "cash_point_closing_id" uuid,
        "entry_type" type_cpc_t NOT NULL,
        "type" payment_type NOT NULL,
        "currency_code" char(3) NOT NULL,
        "amount" numeric(15,5) NOT NULL,
        "name" varchar(60),
        "foreign_amount" numeric(15,5)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "lineitems" (
        "lineitem_id" uuid PRIMARY KEY,
        "lineitem_export_id" varchar(50) NOT NULL,
        "transaction_id" uuid NOT NULL,
        "business_case_type" business_case_type NOT NULL,
        "business_case_name" varchar(40),
        "business_case_id" uuid NOT NULL,
        "purchaser_agency_id" uuid,
        "purchaser_agency_revision" smallint,
        "storno" boolean NOT NULL,
        "text" varchar(255) NOT NULL,
        "in_house" boolean DEFAULT true,
        "voucher_id" varchar(50),
        "item_number" varchar(50) NOT NULL,
        "quantity" numeric(13,3) NOT NULL,
        "price_per_unit" numeric(15,5) NOT NULL,
        "gtin" varchar(50),
        "quantity_factor" numeric(5,3),
        "quantity_measure" varchar(50),
        "group_id" varchar(40),
        "group_name" varchar(50),
        "reference_transaction_uuid" uuid
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "amounts_per_vat_ids" (
        "amounts_per_vat_id" uuid PRIMARY KEY,
        "lineitem_id" uuid,
        "transaction_id" uuid,
        "business_case_id" uuid,
        "entry_type" amount_type NOT NULL,
        "vat_definition_id" uuid NOT NULL,
        "vat_definition_revision" smallint NOT NULL,
        "excl_vat" numeric(15,5) NOT NULL,
        "vat" numeric(15,5) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "transaction_references" (
        "transaction_reference_id" uuid PRIMARY KEY,
        "transaction_id" uuid NOT NULL,
        "lineitem_id" uuid,
        "entry_type" type_t_li NOT NULL,
        "cash_point_closing_export_id" integer NOT NULL,
        "cash_register_id" varchar(50) NOT NULL,
        "transaction_export_id" varchar(40) NOT NULL,
        "date" timestamp
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "external_references" (
        "external_reference_id" uuid PRIMARY KEY,
        "transaction_id" uuid NOT NULL,
        "lineitem_id" uuid,
        "entry_type" type_t_li NOT NULL,
        "type" external_references_type NOT NULL,
        "external_reference_export_id" varchar(40) NOT NULL,
        "name" varchar(40),
        "date" timestamp
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "subitems" (
        "subitem_id" uuid PRIMARY KEY,
        "lineitem_id" uuid NOT NULL,
        "number" varchar(50) NOT NULL,
        "quantity" numeric(13,3) NOT NULL,
        "vat_definition_id" uuid NOT NULL,
        "vat_definition_revision" smallint NOT NULL,
        "amount_excl_vat" numeric(15,5) NOT NULL,
        "vat_amount" numeric(15,5) NOT NULL,
        "gtin" varchar(50),
        "name" varchar(60),
        "quantity_factor" numeric(5,3),
        "quantity_measure" varchar(50),
        "group_id" varchar(40),
        "group_name" varchar(50)
      );
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD CONSTRAINT "cash_point_closings_cash_registers_fk" FOREIGN KEY ("client_id", "client_revision") REFERENCES "cash_registers" ("client_id", "revision") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "payment_types" 
        ADD CONSTRAINT "payment_types_cash_point_closings_fk" FOREIGN KEY ("cash_point_closing_id") REFERENCES "cash_point_closings" ("cash_point_closing_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "payment_types" 
        ADD CONSTRAINT "payment_types_transactions_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "cash_amounts_by_currency"
        ADD CONSTRAINT "cash_amounts_by_currency_cash_point_closings_fk" FOREIGN KEY ("cash_point_closing_id") REFERENCES "cash_point_closings" ("cash_point_closing_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "lineitems"
	      ADD CONSTRAINT "lineitems_business_cases_fk" FOREIGN KEY ("business_case_id") REFERENCES "business_cases" ("business_case_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ADD CONSTRAINT "lineitems_transactions_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "lineitems" 
	      ADD CONSTRAINT "lineitems_purchaser_agencies_fk" FOREIGN KEY ("purchaser_agency_id", "purchaser_agency_revision") REFERENCES "purchaser_agencies" ("purchaser_agency_id", "revision") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "subitems" 
        ADD CONSTRAINT "subitems_vat_definitions_fk" FOREIGN KEY ("vat_definition_id", "vat_definition_revision") REFERENCES "vat_definitions" ("vat_definition_id", "revision") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "subitems"
	      ADD CONSTRAINT "subitems_lineitems_fk" FOREIGN KEY ("lineitem_id") REFERENCES "lineitems" ("lineitem_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ADD CONSTRAINT "amounts_per_vat_ids_vat_definitions_fk" FOREIGN KEY ("vat_definition_id", "vat_definition_revision") REFERENCES "vat_definitions" ("vat_definition_id", "revision") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ADD CONSTRAINT "amounts_per_vat_ids_lineitems_fk" FOREIGN KEY ("lineitem_id") REFERENCES "lineitems" ("lineitem_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
	      ADD CONSTRAINT "amounts_per_vat_ids_business_cases_fk" FOREIGN KEY ("business_case_id") REFERENCES "business_cases" ("business_case_id");
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
	      ADD CONSTRAINT "amounts_per_vat_ids_transactions_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "business_cases"
        ADD CONSTRAINT "business_cases_cash_point_closings_fk" FOREIGN KEY ("cash_point_closing_id") REFERENCES "cash_point_closings" ("cash_point_closing_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "business_cases" 
	      ADD CONSTRAINT "business_cases_purchaser_agencies_fk" FOREIGN KEY ("purchaser_agency_id", "purchaser_agency_revision") REFERENCES "purchaser_agencies" ("purchaser_agency_id", "revision") ON DELETE RESTRICT;
    `;

    await sql`
      ALTER TABLE "transactions"
	      ADD CONSTRAINT "transactions_cash_point_closings_fk" FOREIGN KEY ("cash_point_closing_id") REFERENCES "cash_point_closings" ("cash_point_closing_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "external_references"
	      ADD CONSTRAINT "external_references_transactions_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "external_references"
	      ADD CONSTRAINT "external_references_lineitems_fk" FOREIGN KEY ("lineitem_id") REFERENCES "lineitems" ("lineitem_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "transaction_references"
	      ADD CONSTRAINT "transaction_references_transactions_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id") ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE "transaction_references"
	      ADD CONSTRAINT "transaction_references_lineitems_fk" FOREIGN KEY ("lineitem_id") REFERENCES "lineitems" ("lineitem_id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "cash_point_closings" 
        DROP CONSTRAINT "cash_point_closings_cash_registers_fk";
    `;

    await sql`
      ALTER TABLE "payment_types" 
        DROP CONSTRAINT "payment_types_cash_point_closings_fk";
    `;

    await sql`
      ALTER TABLE "payment_types"
        DROP CONSTRAINT "payment_types_transactions_fk";
    `;

    await sql`
      ALTER TABLE "cash_amounts_by_currency"
        DROP CONSTRAINT "cash_amounts_by_currency_cash_point_closings_fk";
    `;

    await sql`
      ALTER TABLE "lineitems"
        DROP CONSTRAINT "lineitems_business_cases_fk";
    `;

    await sql`
      ALTER TABLE "lineitems"
        DROP CONSTRAINT "lineitems_transactions_fk";
    `;

    await sql`
      ALTER TABLE "lineitems"
        DROP CONSTRAINT "lineitems_purchaser_agencies_fk";
    `;

    await sql`
      ALTER TABLE "subitems"
        DROP CONSTRAINT "subitems_vat_definitions_fk";
    `;

    await sql`
      ALTER TABLE "subitems"
        DROP CONSTRAINT "subitems_lineitems_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        DROP CONSTRAINT "amounts_per_vat_ids_vat_definitions_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        DROP CONSTRAINT "amounts_per_vat_ids_lineitems_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        DROP CONSTRAINT "amounts_per_vat_ids_business_cases_fk";
    `;

    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        DROP CONSTRAINT "amounts_per_vat_ids_transactions_fk";
    `;

    await sql`
      ALTER TABLE "business_cases"
        DROP CONSTRAINT "business_cases_cash_point_closings_fk";
    `;

    await sql`
      ALTER TABLE "business_cases"
        DROP CONSTRAINT "business_cases_purchaser_agencies_fk";
    `;

    await sql`
      ALTER TABLE "transactions"
        DROP CONSTRAINT "transactions_cash_point_closings_fk";
    `;

    await sql`
      ALTER TABLE "external_references"
        DROP CONSTRAINT "external_references_transactions_fk";
    `;

    await sql`
      ALTER TABLE "external_references"
        DROP CONSTRAINT "external_references_lineitems_fk";
    `;

    await sql`
      ALTER TABLE "transaction_references"
        DROP CONSTRAINT "transaction_references_transactions_fk";
    `;

    await sql`
      ALTER TABLE "transaction_references"
        DROP CONSTRAINT "transaction_references_lineitems_fk";
    `;

    await sql`
      DROP TABLE IF EXISTS "subitems";
    `;

    await sql`
      DROP TABLE IF EXISTS "cash_point_closings";
    `;

    await sql`
      DROP TABLE IF EXISTS "transactions";
    `;

    await sql`
      DROP TABLE IF EXISTS "business_cases";
    `;

    await sql`
      DROP TABLE IF EXISTS "cash_amounts_by_currency";
    `;

    await sql`
      DROP TABLE IF EXISTS "payment_types";
    `;

    await sql`
      DROP TABLE IF EXISTS "lineitems";
    `;

    await sql`
      DROP TABLE IF EXISTS "amounts_per_vat_ids";
    `;

    await sql`
      DROP TABLE IF EXISTS "transaction_references";
    `;

    await sql`
      DROP TABLE IF EXISTS "external_references";
    `;

    await sql`
      DROP TYPE IF EXISTS "tx_type";
    `;

    await sql`
      DROP TYPE IF EXISTS "type_cpc_t";
    `;

    await sql`
      DROP TYPE IF EXISTS "type_t_li";
    `;

    await sql`
      DROP TYPE IF EXISTS "payment_type";
    `;

    await sql`
      DROP TYPE IF EXISTS "business_case_type";
    `;

    await sql`
      DROP TYPE IF EXISTS "amount_type";
    `;

    await sql`
      DROP TYPE IF EXISTS "external_references_type";
    `;
  } catch (error) {
    console.error(error);
  }
};
