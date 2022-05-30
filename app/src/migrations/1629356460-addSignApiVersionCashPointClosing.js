exports.up = async (sql) => {
  await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "sign_api_version" smallint;
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
