exports.up = async (sql) => {
  await sql`
    ALTER TABLE "export_requests"
      ADD COLUMN sign_queue_message TEXT;
  `;
};

exports.down = async () => {
  return Promise.resolve();
};
