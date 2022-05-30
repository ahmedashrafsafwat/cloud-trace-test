exports.up = async (sql) => {
  await sql`
    ALTER TABLE "requests"
      ALTER COLUMN path TYPE text;
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
