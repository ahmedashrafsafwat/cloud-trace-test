exports.up = async (sql) => {
  await sql`
      CREATE TABLE "export_requests" (
        "export_id" uuid PRIMARY KEY,
        "request_body" text NOT NULL,
        "organization_id" uuid NOT NULL,
        "time_creation" timestamp DEFAULT now () NOT NULL,
        "env" environment NOT NULL
      );
    `;
};

exports.down = async () => {
  return Promise.resolve();
};
