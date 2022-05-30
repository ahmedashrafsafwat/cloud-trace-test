exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitems" 
        RENAME COLUMN "reference_transaction_uuid" TO "reference_transaction_id";
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ADD CONSTRAINT "lineitems_transactions_reference_fk" FOREIGN KEY ("reference_transaction_id") REFERENCES "transactions" ("transaction_id");
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitems"
        DROP CONSTRAINT "lineitems_transactions_reference_fk";
    `;

    await sql`
      ALTER TABLE "lineitems" 
        RENAME COLUMN "reference_transaction_id" TO "reference_transaction_uuid";
    `;
  } catch (error) {
    console.error(error);
  }
};
