exports.up = async function (sql) {
  try {
    await sql`TRUNCATE TABLE exports CASCADE`;
    await sql`
      ALTER TABLE exports
      ADD COLUMN organization_id uuid NOT NULL
  `;
  } catch (error) {}
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE exports
      DROP COLUMN IF EXISTS organization_id
    `;
  } catch (error) {}
};
