exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE amounts_per_vat_ids
      ALTER COLUMN excl_vat TYPE numeric(15,5),
      ALTER COLUMN incl_vat TYPE numeric(15,5),
      ALTER COLUMN vat TYPE numeric(15,5);
    `;
    await sql`
      ALTER TABLE subitems
      ALTER COLUMN amount_excl_vat TYPE numeric(15,5),
      ALTER COLUMN amount_incl_vat TYPE numeric(15,5),
      ALTER COLUMN vat_amount TYPE numeric(15,5);
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE amounts_per_vat_ids
      ALTER COLUMN excl_vat TYPE numeric(12,2),
      ALTER COLUMN incl_vat TYPE numeric(12,2),
      ALTER COLUMN vat TYPE numeric(12,2);
      `;
    await sql`
      ALTER TABLE subitems
      ALTER COLUMN amount_excl_vat TYPE numeric(12,2),
      ALTER COLUMN amount_incl_vat TYPE numeric(12,2),
      ALTER COLUMN vat_amount TYPE numeric(12,2);
    `;
  } catch (error) {
    console.error(error);
  }
};
