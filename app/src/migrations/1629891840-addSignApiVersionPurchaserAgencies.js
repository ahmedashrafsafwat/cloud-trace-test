exports.up = async (sql) => {
  try {
    await sql`
      ALTER TABLE "purchaser_agencies" 
        ADD COLUMN "sign_api_version" smallint;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async () => {
  return Promise.resolve();
};
