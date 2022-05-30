exports.up = async (sql) => {
  try {
    await sql`
    ALTER TABLE "exports"
      ALTER COLUMN error_message TYPE TEXT;
  `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async () => {
  return Promise.resolve();
};
