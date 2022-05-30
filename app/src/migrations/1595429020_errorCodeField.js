exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE "cash_point_closings"
        ADD COLUMN error_code VARCHAR;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function () {
  return Promise.resolve();
};
