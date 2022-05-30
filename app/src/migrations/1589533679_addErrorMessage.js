exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "transactions" 
        ADD COLUMN "error_message" varchar(200);
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE "transactions" 
        DROP COLUMN "error_message";
    `;
  } catch (error) {
    console.error(error);
  }
};
