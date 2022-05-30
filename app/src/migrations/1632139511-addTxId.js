exports.up = async (sql) => {
  await sql`
    ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS tx_id UUID;
  `;
};

exports.down = () => {
  return Promise.resolve();
};
