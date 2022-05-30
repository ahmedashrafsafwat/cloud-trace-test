exports.up = async function (sql) {
  try {
    // Add columns
    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "cash_point_closing_export_id" int4;
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "first_transaction_export_id" varchar(40);
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "last_transaction_export_id" varchar(40);
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "export_creation_date" timestamp;
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "business_date" timestamp;
    `;

    // Update old records
    await sql`
      UPDATE "cash_point_closings" 
        SET 
          "cash_point_closing_export_id" = 0, 
          "first_transaction_export_id" = '0', 
          "last_transaction_export_id" = '9999', 
          "export_creation_date" = now ()
      ;
    `;

    // Set NOT NULL constraints
    await sql`
      ALTER TABLE "cash_point_closings" 
        ALTER COLUMN "cash_point_closing_export_id" SET NOT NULL;
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ALTER COLUMN "first_transaction_export_id" SET NOT NULL;
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ALTER COLUMN "last_transaction_export_id" SET NOT NULL;
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        ALTER COLUMN "export_creation_date" SET NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "cash_point_closings"
        DROP COLUMN "business_date";
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        DROP COLUMN "export_creation_date";
    `;

    await sql`
      ALTER TABLE "cash_point_closings"
        DROP COLUMN "last_transaction_export_id";
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        DROP COLUMN "first_transaction_export_id";
    `;

    await sql`
      ALTER TABLE "cash_point_closings" 
        DROP COLUMN "cash_point_closing_export_id";
    `;
  } catch (error) {
    console.error(error);
  }
};
