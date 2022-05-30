exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE cash_point_closings
      ALTER COLUMN client_id drop NOT NULL,
      ALTER COLUMN client_revision drop NOT NULL,
      ALTER COLUMN payment_full_amount drop NOT NULL,
      ALTER COLUMN payment_cash_amount drop NOT NULL,
      ALTER COLUMN cash_point_closing_export_id drop NOT NULL,
      ALTER COLUMN first_transaction_export_id drop NOT NULL,
      ALTER COLUMN last_transaction_export_id drop NOT NULL,
      ALTER COLUMN export_creation_date drop NOT NULL,
      ADD COLUMN organization_id uuid;
    `;
  } catch (error) {
    console.error(error);
  }
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE cash_point_closings 
      ALTER COLUMN client_id SET NOT NULL,
      ALTER COLUMN client_revision SET NOT NULL,
      ALTER COLUMN payment_full_amount SET NOT NULL,
      ALTER COLUMN payment_cash_amount SET NOT NULL,
      ALTER COLUMN cash_point_closing_export_id SET NOT NULL,
      ALTER COLUMN first_transaction_export_id SET NOT NULL,
      ALTER COLUMN last_transaction_export_id SET NOT NULL,
      ALTER COLUMN export_creation_date SET NOT NULL;
    `;
  } catch (error) {
    console.error(error);
  }
};
