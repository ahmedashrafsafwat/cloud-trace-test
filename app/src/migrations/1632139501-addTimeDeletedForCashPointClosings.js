exports.up = async (sql) => {
  await sql`
      ALTER TABLE "cash_point_closings" 
        ADD COLUMN "time_deleted" timestamp;
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
