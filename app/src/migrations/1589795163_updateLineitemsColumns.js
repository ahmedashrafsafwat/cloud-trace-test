exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "item_number" DROP NOT NULL;
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "quantity" DROP NOT NULL;
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "price_per_unit" DROP NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "price_per_unit" SET NOT NULL;
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "quantity" SET NOT NULL;
    `;

    await sql`
      ALTER TABLE "lineitems" 
        ALTER COLUMN "item_number" SET NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};
