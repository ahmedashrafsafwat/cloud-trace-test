exports.up = async (sql) => {
  await sql`
    ALTER TABLE subitems
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;
  await sql`
    ALTER TABLE transaction_internal_references
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id),
      ADD COLUMN IF NOT EXISTS referenced_cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;
  await sql`
    ALTER TABLE lineitem_internal_references
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id),
      ADD COLUMN IF NOT EXISTS referenced_cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;
  await sql`
    ALTER TABLE external_references
      ADD COLUMN IF NOT EXISTS cash_point_closing_id UUID REFERENCES cash_point_closings(cash_point_closing_id);
  `;
};

exports.down = () => {
  return Promise.resolve();
};
