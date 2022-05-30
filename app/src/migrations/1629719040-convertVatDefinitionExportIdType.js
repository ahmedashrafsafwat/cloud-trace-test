exports.up = async (sql) => {
  await sql`
    ALTER TABLE "vat_definitions"
      ALTER COLUMN vat_definition_export_id TYPE bigint;
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
