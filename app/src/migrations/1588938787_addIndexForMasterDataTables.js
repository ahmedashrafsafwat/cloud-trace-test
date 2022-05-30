exports.up = async function (sql) {
  try {
    await sql`
      CREATE UNIQUE INDEX "vat_definitions_unique_index" ON "vat_definitions" 
      USING BTREE ("vat_definition_export_id","organization_id","revision");
    `;

    await sql`
      CREATE UNIQUE INDEX "purchaser_agencies_unique_index" ON "purchaser_agencies" 
      USING BTREE ("purchaser_agency_export_id","organization_id","revision");
    `;

    await sql`
      CREATE UNIQUE INDEX "cash_registers_unique_index" ON "cash_registers" 
      USING BTREE ("client_id","organization_id","revision");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      DROP INDEX IF EXISTS "vat_definitions_unique_index";
    `;

    await sql`
      DROP INDEX IF EXISTS "purchaser_agencies_unique_index";
    `;

    await sql`
      DROP INDEX IF EXISTS "cash_registers_unique_index";
    `;
  } catch (error) {
    console.error(error);
  }
};
