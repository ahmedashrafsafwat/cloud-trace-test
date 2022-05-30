exports.up = async (sql) => {
  await sql`
    ALTER TABLE "lineitems"
      ALTER COLUMN quantity_factor TYPE numeric(10, 3);
  `;
  await sql`
    ALTER TABLE "subitems"
      ALTER COLUMN quantity_factor TYPE numeric(10, 3);
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
