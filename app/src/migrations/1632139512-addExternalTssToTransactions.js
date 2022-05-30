exports.up = async (sql) => {
  await sql`
    ALTER TABLE "transactions"
      ADD COLUMN "tx_number" bigint,
      ADD COLUMN "tx_start" timestamp(3),
      ADD COLUMN "tx_end" timestamp(3),
      ADD COLUMN "process_type" varchar(30),
      ADD COLUMN "process_data" text,
      ADD COLUMN "signature_counter" bigint,
      ADD COLUMN "signature" varchar(512);
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
