exports.up = async function (sql) {
  try {
    // Add column
    await sql`
      ALTER TABLE "subitems" 
        ADD COLUMN "amount_incl_vat" numeric(15,5);
    `;

    // Update old records
    await sql`
      UPDATE "subitems" 
        SET "amount_incl_vat" = "amount_excl_vat" + "vat_amount";
    `;

    // Set NOT NULL constraint
    await sql`
      ALTER TABLE "subitems" 
        ALTER COLUMN "amount_incl_vat" SET NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "subitems"
        DROP COLUMN "amount_incl_vat";
    `;
  } catch (error) {
    console.error(error);
  }
};
