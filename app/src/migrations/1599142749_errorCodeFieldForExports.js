exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "exports"
        ADD COLUMN error_code VARCHAR;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function () {
  return Promise.resolve();
};
