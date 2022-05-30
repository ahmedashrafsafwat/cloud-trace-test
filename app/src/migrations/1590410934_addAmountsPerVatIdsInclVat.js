exports.up = async function (sql) {
  try {
    // Add column
    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ADD COLUMN "incl_vat" numeric(15,5);
    `;

    // Update old records
    await sql`
      UPDATE "amounts_per_vat_ids" 
        SET "incl_vat" = "excl_vat" + "vat";
    `;

    // Set NOT NULL constraint
    await sql`
      ALTER TABLE "amounts_per_vat_ids" 
        ALTER COLUMN "incl_vat" SET NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        DROP COLUMN "incl_vat";
    `;
  } catch (error) {
    console.error(error);
  }
};
