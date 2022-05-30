exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "vat_definitions"
      RENAME COLUMN export_id TO vat_definition_export_id;
    `;

    await sql`
      ALTER TABLE "purchaser_agencies"
      RENAME COLUMN export_id TO purchaser_agency_export_id;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "vat_definitions"
      RENAME COLUMN vat_definition_export_id TO export_id;
    `;

    await sql`
      ALTER TABLE "purchaser_agencies"
      RENAME COLUMN purchaser_agency_export_id TO export_id;
    `;
  } catch (error) {
    console.error(error);
  }
};
