exports.up = async (sql) => {
  try {
    await sql`
      DROP
      INDEX IF EXISTS "cash_registers_unique_index";
    `;

    await sql`
      CREATE
      UNIQUE INDEX "cash_registers_unique_index" ON "cash_registers" 
      USING BTREE ("client_id","organization_id","revision", "sign_api_version");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async (sql) => {
  try {
    await sql`
      DROP
      INDEX IF EXISTS "cash_registers_unique_index";
    `;

    await sql`
      CREATE
      UNIQUE INDEX "cash_registers_unique_index" ON "cash_registers" 
      USING BTREE ("client_id","organization_id","revision");
    `;
  } catch (error) {
    console.error(error);
  }
};
