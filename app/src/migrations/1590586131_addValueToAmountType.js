exports.up = async function (sql) {
  try {
    // Rename the enum type
    await sql`
      ALTER TYPE "amount_type" RENAME TO "amount_type__";
    `;

    // create new type
    await sql`
      CREATE TYPE "amount_type" AS ENUM ( 
        'transaction',
        'business_case',
        'lineitem_base_amounts',
        'lineitem_discounts',
        'lineitem_extra_amounts',
        'lineitem_business_case'
      );
    `;

    // Rename entry_type which uses the enum type
    await sql`
      ALTER TABLE "amounts_per_vat_ids" RENAME COLUMN "entry_type" TO "entry_type__";
    `;

    // Add new column of new type
    await sql`
      ALTER TABLE "amounts_per_vat_ids"
        ADD "entry_type" "amount_type" NOT NULL DEFAULT 'business_case';
    `;

    // Copy values to the new column
    await sql`
      UPDATE
        "amounts_per_vat_ids"
      SET
        "entry_type" = "entry_type__"::text:: "amount_type";
    `;

    // Remove default value
    await sql`
      ALTER TABLE "amounts_per_vat_ids" ALTER COLUMN "entry_type" SET DEFAULT NULL;
    `;

    // Remove old column and type
    await sql`
      ALTER TABLE "amounts_per_vat_ids" DROP COLUMN "entry_type__";
    `;
    await sql`
      DROP TYPE "amount_type__";
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (_sql) {
  try {
  } catch (error) {
    console.error(error);
  }
};
