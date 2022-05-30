exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "transactions"
        DROP COLUMN "reference_transaction_uuid";
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "transaction_internal_references" (
        "transaction_id" uuid,
        "referenced_transaction_id" uuid,
        PRIMARY KEY ("transaction_id", "referenced_transaction_id")
      );
    `;

    await sql`
      ALTER TABLE "transaction_internal_references" 
        ADD CONSTRAINT "transaction_internal_references_transaction_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("transaction_id");
    `;

    await sql`
      ALTER TABLE "transaction_internal_references"  
        ADD CONSTRAINT "transaction_internal_references_referenced_fk" FOREIGN KEY ("referenced_transaction_id") REFERENCES "transactions" ("transaction_id");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "transaction_internal_references"
        DROP CONSTRAINT "transaction_internal_references_reference_fk";
    `;

    await sql`
      ALTER TABLE "transaction_internal_references"
        DROP CONSTRAINT "transaction_internal_references_transaction_fk";
    `;

    await sql`
      DROP TABLE IF EXISTS "transaction_internal_references";
    `;

    await sql`
      ALTER TABLE "transactions"
        ADD COLUMN "reference_transaction_uuid" uuid;
    `;
  } catch (error) {
    console.error(error);
  }
};
