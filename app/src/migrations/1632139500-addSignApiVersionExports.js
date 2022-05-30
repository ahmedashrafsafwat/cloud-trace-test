exports.up = async (sql) => {
  await sql`
      ALTER TABLE "exports" 
        ADD COLUMN "sign_api_version" smallint;
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
