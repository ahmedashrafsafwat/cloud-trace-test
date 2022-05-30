exports.up = async (sql) => {
  await sql`
    ALTER TABLE cash_registers
      ADD COLUMN serial_number text,
      ADD COLUMN signature_algorithm varchar(255),
      ADD COLUMN signature_timestamp_format varchar(255),
      ADD COLUMN transaction_data_encoding varchar(255),
      ADD COLUMN public_key text,
      ADD COLUMN certificate text;
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
