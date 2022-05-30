exports.up = async (sql) => {
  await sql`
    ALTER TABLE lineitems
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;

  await sql`
    ALTER TABLE amounts_per_vat_ids
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;
};

exports.down = () => {
  return Promise.resolve();
};
