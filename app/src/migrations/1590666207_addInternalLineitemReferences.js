exports.up = async function (sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "lineitem_internal_references" (
        "lineitem_id" uuid,
        "referenced_transaction_id" uuid,
        PRIMARY KEY ("lineitem_id", "referenced_transaction_id")
      );
    `;

    await sql`
      ALTER TABLE "lineitem_internal_references" 
        ADD CONSTRAINT "lineitem_internal_references_transaction_fk" FOREIGN KEY ("lineitem_id") REFERENCES "lineitems" ("lineitem_id");
    `;

    await sql`
      ALTER TABLE "lineitem_internal_references"  
        ADD CONSTRAINT "lineitem_internal_references_referenced_fk" FOREIGN KEY ("referenced_transaction_id") REFERENCES "transactions" ("transaction_id");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitem_internal_references"
        DROP CONSTRAINT "lineitem_internal_references_referenced_fk";
    `;

    await sql`
      ALTER TABLE "lineitem_internal_references"
        DROP CONSTRAINT "lineitem_internal_references_transaction_fk";
    `;

    await sql`
      DROP TABLE IF EXISTS "lineitem_internal_references";
    `;
  } catch (error) {
    console.error(error);
  }
};
