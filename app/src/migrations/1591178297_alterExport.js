exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE exports
      DROP COLUMN IF EXISTS href,
      ADD COLUMN bucket varchar(100),
      ADD COLUMN object varchar(100)
  `;
  } catch (error) {}
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE exports
      ADD COLUMN href varchar(200),
      DROP COLUMN IF EXISTS bucket,
      DROP COLUMN IF EXISTS object
    `;
  } catch (error) {}
};
