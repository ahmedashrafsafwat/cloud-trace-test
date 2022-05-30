exports.up = async (sql) => {
  await sql`
    ALTER TABLE cash_point_closings
      ADD COLUMN IF NOT EXISTS request_id varchar(64);
  `;
};

exports.down = () => {
  return Promise.resolve();
};
