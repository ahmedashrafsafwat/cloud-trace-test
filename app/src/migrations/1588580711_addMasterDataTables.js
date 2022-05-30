exports.up = async function (sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "vat_definitions" (
        "vat_definition_id" uuid,
        "revision" smallint,
        "export_id" smallint NOT NULL,
        "organization_id" uuid NOT NULL,
        "percentage" numeric(5,2) NOT NULL,
        "description" varchar(55),
        "env" environment NOT NULL,
        "version" integer NOT NULL,
        "metadata" json,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "time_update" timestamp DEFAULT now () NOT NULL,
        PRIMARY KEY ("vat_definition_id", "revision")
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "purchaser_agencies" (
        "purchaser_agency_id" uuid,
        "revision" smallint,
        "export_id" integer NOT NULL,
        "organization_id" uuid NOT NULL,
        "name" varchar(60) NOT NULL,
        "tax_number" varchar(20) NOT NULL,
        "client_id" uuid NOT NULL,
        "address" json NOT NULL,
        "vat_id_number" varchar(15),
        "env" environment NOT NULL,
        "version" integer NOT NULL,
        "metadata" json,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "time_update" timestamp DEFAULT now () NOT NULL,
        PRIMARY KEY ("purchaser_agency_id", "revision")
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "cash_registers" (
        "client_id" uuid,
        "revision" smallint,
        "tss_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "base_currency_code" char(3) NOT NULL,
        "brand" varchar(50),
        "model" varchar(50),
        "sw_version" varchar(50),
        "sw_brand" varchar(50),
        "vat_not_determineable" boolean,
        "master_client_id" uuid,
        "version" integer NOT NULL,
        "env" environment NOT NULL,
        "metadata" json,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "time_update" timestamp DEFAULT now () NOT NULL,
        PRIMARY KEY ("client_id", "revision")
      );
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      DROP TABLE IF EXISTS "vat_definitions";
    `;

    await sql`
      DROP TABLE IF EXISTS "purchaser_agencies";
    `;

    await sql`
      DROP TABLE IF EXISTS "cash_registers";
    `;
  } catch (error) {
    console.error(error);
  }
};
