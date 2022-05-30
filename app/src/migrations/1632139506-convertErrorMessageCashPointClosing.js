exports.up = async (sql) => {
  await sql`
    ALTER TABLE "cash_point_closings"
      ALTER COLUMN error_message TYPE TEXT;
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
