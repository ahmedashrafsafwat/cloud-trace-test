exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "cash_registers" 
        ALTER COLUMN "tss_id" DROP NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "cash_registers" 
        ALTER COLUMN "tss_id" SET NOT NULL;
      `;
  } catch (error) {
    console.error(error);
  }
};
