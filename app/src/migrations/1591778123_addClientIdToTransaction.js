exports.up = async function (sql) {
  try {
    await sql`
      ALTER TABLE transactions
      ADD COLUMN closing_client_id uuid,
      ADD COLUMN closing_client_revision smallint;
    `;
    await sql`
      UPDATE transactions t SET (closing_client_id, closing_client_revision) = (SELECT client_id, client_revision FROM cash_point_closings cpc 
      INNER JOIN transactions t1 ON t1.cash_point_closing_id = cpc.cash_point_closing_id
      WHERE t.transaction_id = t1.transaction_id)
    `;
    await sql`
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_cash_registers_fk FOREIGN KEY (closing_client_id, closing_client_revision)
      REFERENCES cash_registers (client_id, revision) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE RESTRICT,
      ALTER COLUMN closing_client_id SET NOT NULL,
      ALTER COLUMN closing_client_revision SET NOT NULL
    `;
  } catch (error) {}
};

exports.down = async function (sql) {
  try {
    await sql`
      ALTER TABLE transactions
      DROP COLUMN IF EXISTS closing_client_id,
      DROP COLUMN IF EXISTS closing_client_revision
    `;
  } catch (error) {}
};
