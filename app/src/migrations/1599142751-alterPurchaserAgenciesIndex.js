exports.up = async (sql) => {
  try {
    await sql`
      DROP
      INDEX IF EXISTS "purchaser_agencies_unique_index";
    `;

    await sql`
      CREATE
      UNIQUE INDEX "purchaser_agencies_unique_index" ON "purchaser_agencies" 
      USING BTREE ("purchaser_agency_export_id", "organization_id", "revision", "client_id", "env");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async (sql) => {
  try {
    await sql`
      DROP
      INDEX IF EXISTS "purchaser_agencies_unique_index";
    `;

    await sql`
      CREATE
      UNIQUE INDEX "purchaser_agencies_unique_index" ON "purchaser_agencies" 
      USING BTREE ("purchaser_agency_export_id","organization_id","revision");
    `;
  } catch (error) {
    console.error(error);
  }
};
